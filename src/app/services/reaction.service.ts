import { inject, Injectable } from '@angular/core';
import { DirectMessageService } from './direct-message.service';
import { ChatService } from './chat.service';
import { UserService } from './user.service';
import { addDoc, collection, doc, Firestore, getDocs, onSnapshot, query, QuerySnapshot, updateDoc, where } from '@angular/fire/firestore';
import { Reaction } from '../../models/reaction.class';
import { User } from '../../models/user.class';
import { DmMessage } from '../../models/direct-message.class';

@Injectable({
  providedIn: 'root'
})
export class ReactionService {
  private firestore: Firestore = inject(Firestore);
  private userService: UserService = inject(UserService);
  private directMessageService: DirectMessageService = inject(DirectMessageService);

  reactionID: string = '';
  currentMessageID: string | null = null;

  moreBtn: boolean = false;


  constructor() {
    this.proofExistingReactions();
  }

  closeMoreBtn() {
    this.moreBtn = false;
  }

  async setReaction(reaction: string, message: DmMessage) {
    const messageID = message.id;
    const profilID = message.authorId;

    
    const docRef = this.getReactionRef();
    const newReaction: Reaction = this.setReactionObject(this.userService.userID, reaction, messageID, profilID);
    const reactionRef = await addDoc(
      docRef,
      newReaction.getJson()
    )

    await this.updateReactionWithID(reactionRef.id);
    // await this.updateReactionWithArray(reaction);
    await this.setReactionIdToDm(message.id);
  }

  getReactionRef() {
    return collection(this.firestore, 'reactions')
  }


  async updateReactionWithID(reactionID: string) {
    const reactionRef = doc(this.firestore, 'reactions', reactionID);
    await updateDoc(reactionRef, {id: reactionID});
    this.reactionID = reactionID;
  }


  getDirectMessageRef(id: string) {
    return doc(this.firestore, `direct-messages/${this.directMessageService.directMessageId}/messages/${id}`);
  }


  async setReactionIdToDm(id: string) {
    const dmRef = this.getDirectMessageRef(id);
    await updateDoc(dmRef, {
      reactionID: this.reactionID
    })
  }
  

  // getReactionArrayRef() {
  //   return collection(this.firestore, `reactions/${this.reactionID}/reactionArray`)
  // }


  // async updateReactionWithArray(reaction: string) {
  //   const reactionRef = this.getReactionArrayRef();
  //   const arrayID = await addDoc(reactionRef, {'reaction': reaction});
  //   await updateDoc(arrayID, {id: arrayID.id});
  // }


  setReactionObject(authorID: string, reaction: string, messageID: string, profileID: string): Reaction {
    return new Reaction({
      authorID: authorID ||'',
      profileID: profileID || '',
      reaction: reaction || '',
      messageID: messageID || '',
      id: '',  
    })
  }

async proofExistingReactions() {
  const reactionRef = this.getReactionRef();
  const q = query(reactionRef, where("reaction", "==", "check"));

  onSnapshot(q, (querySnapshot: QuerySnapshot) => {
    querySnapshot.forEach((doc) => {
      const ref = doc.data();
      this.currentMessageID = ref['messageID'];

      

      // console.log(`Änderung erkannt: ${ref['messageID']}`);
    });
  });
}
}
