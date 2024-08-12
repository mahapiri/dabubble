import { inject, Injectable } from '@angular/core';
import { Firestore, collection, addDoc, doc, updateDoc, getDocs, query, where, deleteDoc, onSnapshot } from '@angular/fire/firestore';
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
  reactionCounts: { [messageID: string]: { [reactionType: string]: number } } = {};
  moreBtn: boolean = false;

  constructor() {
  }


  closeMoreBtn() {
    this.moreBtn = false;
  }


  async setReaction(reaction: string, message: DmMessage) {
    const messageID = message.id;
    const userID = this.userService.userID;

    if (this.activeReactions[messageID]) {
      const currentReaction = this.activeReactions[messageID];
      if (currentReaction === reaction) {
        await this.removeReaction(reaction, messageID, userID);
        return;
      } else {
        await this.removeReaction(currentReaction, messageID, userID);
      }
    }

    this.activeReactions[messageID] = reaction;

    try {
      const docRef = this.getReactionRef();
      const newReaction: Reaction = this.setReactionObject(userID, reaction, messageID, message.authorId);
      const reactionRef = await addDoc(docRef, newReaction.getJson());

      await this.updateReactionWithID(reactionRef.id);
      await this.setReactionIdToDm(message.id, reactionRef.id);
    } catch (error) {
      console.warn("Error", error);
      delete this.activeReactions[messageID];
    }
  }


  async removeReaction(reaction: string, messageID: string, userID: string) {
    const reactionRef = this.getReactionRef();
    const q = query(reactionRef, where('reaction', '==', reaction), where('messageID', '==', messageID), where('authorID', '==', userID));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });

    delete this.activeReactions[messageID];
  }


  getReactionRef() {
    return collection(this.firestore, 'reactions');
  }


  async updateReactionWithID(reactionID: string) {
    const reactionRef = doc(this.firestore, 'reactions', reactionID);
    await updateDoc(reactionRef, { id: reactionID });
  }


  getDirectMessageRef(id: string) {
    return doc(this.firestore, `direct-messages/${this.directMessageService.directMessageId}/messages/${id}`);
  }


  async setReactionIdToDm(id: string, reactionID: string) {
    const dmRef = this.getDirectMessageRef(id);
    await updateDoc(dmRef, {
      reactionID: reactionID,
    });
  }


  setReactionObject(authorID: string, reaction: string, messageID: string, profileID: string): Reaction {
    return new Reaction({
      authorID: authorID || '',
      profileID: profileID || '',
      reaction: reaction || '',
      messageID: messageID || '',
      id: '',
    });
  }


  isReactionActive(messageID: string, reaction: string): boolean {
    return this.activeReactions[messageID] === reaction;
  }


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
      console.log(`Updated reactions for message ${messageID}:`, this.reactionsSubject.getValue()[messageID]);
    });
  }

}
