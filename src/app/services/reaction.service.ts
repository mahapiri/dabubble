import { inject, Injectable } from '@angular/core';
import { 
  Firestore, 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  onSnapshot, 
  getDoc 
} from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { Reaction } from '../../models/reaction.class';
import { UserService } from './user.service';
import { DirectMessageService } from './direct-message.service';
import { DmMessage } from '../../models/direct-message.class';

@Injectable({
  providedIn: 'root',
})
export class ReactionService {
  private firestore: Firestore = inject(Firestore);
  private userService: UserService = inject(UserService);
  private directMessageService: DirectMessageService = inject(DirectMessageService);

  private reactionsSubject = new BehaviorSubject<any>({});
  reactions$ = this.reactionsSubject.asObservable();

  activeReactions: { [messageID: string]: string } = {};
  reactionCounts: { [messageID: string]: { [reactionType: string]: { count: number; authorIDs: string[] } } } = {};

  moreBtn: boolean = false;

  constructor() { }


  /**
  * Closes or hides the "smiley-icon" button by setting its state to false.
  */
  closeMoreBtn() {
    this.moreBtn = false;
  }


  /**
  * Sets a reaction to a message.
  * If the same reaction already exists, it will be removed.
  * Otherwise, the reaction will be updated and saved in the database.
  */
  async setReaction(reaction: string, message: DmMessage) {
    const messageID = message.id;
    const userID = this.userService.userID;
    console.log(messageID);

    if (this.activeReactions[messageID] === reaction) {
      await this.removeReaction(reaction, messageID, userID);
      delete this.activeReactions[messageID];
      console.log('removeReaction')
      return;
    }

    try {
      if (this.activeReactions[messageID]) {
        await this.removeReaction(this.activeReactions[messageID], messageID, userID);
      }

      this.activeReactions[messageID] = reaction;
      const docRef = this.getReactionRef();
      console.log(message.authorId)
      const newReaction: Reaction = this.setReactionObject(userID, reaction, messageID, message.authorId);
      const reactionRef = await addDoc(docRef, newReaction.getJson());

      await this.updateReactionWithID(reactionRef.id);
      // await this.setReactionIdToDm(message.id, reactionRef.id); // muss noch angepasst werden für channel / thread
    } catch (error) {
      console.warn("Error", error);
      delete this.activeReactions[messageID];  // Lokalen Zustand im Fehlerfall bereinigen
    }
  }


  /**
  * Removes a reaction from a message.
  * It searches for the specific reaction by the user on the given message and deletes it.
  */
  async removeReaction(reaction: string, messageID: string, userID: string) {
    const reactionRef = this.getReactionRef();
    const q = query(reactionRef, where('reaction', '==', reaction), where('messageID', '==', messageID), where('authorID', '==', userID));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });

    delete this.activeReactions[messageID];
  }


  /**
  * Returns a reference to the 'reactions' collection in the Firestore database.
  * This reference is used to interact with the 'reactions' data.
  */
  getReactionRef() {
    return collection(this.firestore, 'reactions');
  }


  /**
  * Updates a reaction document in the Firestore database with its own ID.
  */
  async updateReactionWithID(reactionID: string) {
    const reactionRef = doc(this.firestore, 'reactions', reactionID);
    await updateDoc(reactionRef, { id: reactionID });
  }


  /**
  * Returns a reference to a specific direct message document in the Firestore database.
  */
  getDirectMessageRef(id: string) {
    return doc(this.firestore, `direct-messages/${this.directMessageService.directMessageId}/messages/${id}`);
  }


  /**
  * Associates a reaction ID with a specific direct message in the Firestore database.
  * This function updates the direct message document to include the reaction ID.
  */
  async setReactionIdToDm(id: string, reactionID: string) {
    const dmRef = this.getDirectMessageRef(id);
    await updateDoc(dmRef, {
      reactionID: reactionID,
    });
  }


  /**
  * Creates and returns a new Reaction object with the provided details.
  */
  setReactionObject(authorID: string, reaction: string, messageID: string, profileID: string): Reaction {
    return new Reaction({
      authorID: authorID || '',
      profileID: profileID || '',
      reaction: reaction || '',
      messageID: messageID || '',
      id: '',
    });
  }


  /**
  * Checks if a specific reaction is currently active for a given message.
  */
  isReactionActive(messageID: string, reaction: string): boolean {
    return this.activeReactions[messageID] === reaction;
  }


  /**
  * Loads reactions for a specific message from the Firestore database.
  * It fetches the reactions, processes them to count occurrences, identifies the user's reaction,
  * and updates the state with this data.
  */
  loadReactionsForMessage(messageID: string) {
    const reactionRef = this.getReactionRef();
    const q = query(reactionRef, where('messageID', '==', messageID));

    onSnapshot(q, (querySnapshot) => {
      const messageReactions: { reactionType: string; count: number; authorIDs: string[] }[] = [];
      const reactionCounts: { [reactionType: string]: { count: number; authorIDs: string[] } } = {};

      let userReaction = '';

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const reactionType = data['reaction'];
        const authorID = data['authorID'];

        if (!reactionCounts[reactionType]) {
          reactionCounts[reactionType] = { count: 0, authorIDs: [] };
        }

        reactionCounts[reactionType].count++;

        if (!reactionCounts[reactionType].authorIDs.includes(authorID)) {
          reactionCounts[reactionType].authorIDs.push(authorID);
        }

        if (authorID === this.userService.userID) {
          userReaction = reactionType;
        }
      });

      for (const reactionType in reactionCounts) {
        messageReactions.push({
          reactionType: reactionType,
          count: reactionCounts[reactionType].count,
          authorIDs: reactionCounts[reactionType].authorIDs,
        });
      }

      this.activeReactions[messageID] = userReaction;

      this.reactionsSubject.next({
        ...this.reactionsSubject.getValue(),
        [messageID]: messageReactions,
      });
    });
  }


  /**
  * Retrieves the username of a user based on their user ID from the Firestore database.
  * If the user document exists, it returns the username. Otherwise, it returns 'Unknown'.
  */
  async getUsername(userID: string): Promise<string> {
    try {
      const userRef = doc(this.firestore, 'users', userID);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData['username'] || 'Unknown';
      } else {
        return 'Gast (Profil gelöscht)';
      }
    } catch (error) {
      return 'Unknown';
    }
  }
}
