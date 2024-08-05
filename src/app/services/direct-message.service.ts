import { inject, Injectable } from '@angular/core';
import { UserService } from './user.service';
import { addDoc, collection, doc, Firestore, getDocs, setDoc, where, query, updateDoc } from '@angular/fire/firestore';
import { User } from '../../models/user.class';
import { BehaviorSubject } from 'rxjs';
import { update } from '@angular/fire/database';
import { DmMessage } from '../../models/direct-message.class';

@Injectable({
  providedIn: 'root'
})
export class DirectMessageService {
  private firestore: Firestore = inject(Firestore);
  private userService: UserService = inject(UserService);
  private userSubject = new BehaviorSubject<User | null>(null);
  public userSelected$ = this.userSubject.asObservable();

  directMessageId: string | null = '';

  constructor() { }


  getActualProfile(profile: User) {
    this.userSubject.next(profile);
  }


  async addDirectMessage(profile: User) {
    const currentUserId = this.getCurrentUserID();
    const otherUserId = profile.userId;

    let exisitingDmId: any;

    if (currentUserId === otherUserId) {
      exisitingDmId = await this.handleSelfDm(currentUserId);
    } else {
      exisitingDmId = await this.handleUsertoUserDm(currentUserId, otherUserId);
    }

    return exisitingDmId;
  }


  async handleSelfDm(userId: string) {
    const existingOwnDmId = await this.proofExistingOwnDm(userId);

    if (!existingOwnDmId) {
      const messageRef = await addDoc(collection(this.firestore, 'direct-messages'), {
        userIDs: [userId],
      });
      await this.setDirectMessageID(messageRef.id);
      this.directMessageId = messageRef.id;
      return messageRef.id;
    } else {
      console.log('Own Channel exist already', existingOwnDmId)
      this.directMessageId = existingOwnDmId;
      return existingOwnDmId;
    }

  }


  async handleUsertoUserDm(currentUserId: string, otherUserId: string) {
    const existingDmId = await this.proofExistingDm(currentUserId, otherUserId);

    if (!existingDmId) {
      const messageRef = await addDoc(collection(this.firestore, 'direct-messages'), {
        userIDs: [otherUserId, currentUserId],
      });
      await this.setDirectMessageID(messageRef.id);
      this.directMessageId = messageRef.id;
      return messageRef.id;
    } else {
      console.log('Channel exist already', existingDmId)
      this.directMessageId = existingDmId;
      return existingDmId;
    }

  }


  async setDirectMessageID(id: string) {
    const docRef = doc(this.getCollectionRef(), id);
    await setDoc(docRef, {
      directMessageID: id,
    }, { merge: true });
  }


  getCollectionRef() {
    return collection(this.firestore, 'direct-messages');
  }

  getMessageRef() {
    return collection(this.firestore, `direct-messages/${this.directMessageId}/messages`);
  }


  getCurrentUserID() {
    return this.userService.getUserRef().id;
  }


  async proofExistingDm(currentUserId: string, otherUserId: string): Promise<string | null> {
    const directMessageRef = this.getCollectionRef();
    const q = query(directMessageRef, where('userIDs', 'array-contains', currentUserId));
    const querySnapshot = await getDocs(q);

    for (const doc of querySnapshot.docs) {
      const userIds = doc.data()['userIDs'] as string[];
      if ((userIds.includes(otherUserId) && userIds.includes(currentUserId)) || (currentUserId === otherUserId && userIds.includes(currentUserId))) {
        return doc.id;
      }
    }
    return null;
  }


  async proofExistingOwnDm(userId: string): Promise<string | null> {
    const directMessageRef = this.getCollectionRef();
    const q = query(directMessageRef, where('userIDs', 'array-contains', userId));
    const querySnapshot = await getDocs(q);

    for (const document of querySnapshot.docs) {
      const userIds = document.data()['userIDs'] as string[];
      if (userIds.length === 1 && userIds.includes(userId)) {
        return document.id;
      }
    }
    return null;
  }


  async createMessageToDm(messageData: any, profile: any) {
    this.addDirectMessage(profile);
    const docRef = doc(this.getMessageRef());
    await setDoc(docRef, messageData,
      { merge: true });
  }


  async showDmMessages(profile: User) {
    let currentUser = this.getCurrentUserID();
    let messageRef = await this.addDirectMessage(profile);
    console.log('Eingeloggter User:', currentUser,'Auf Profil geklickt:', profile.userId, 'messageRef:', messageRef);
    this.getMessageRefForId(messageRef);
    this.getMessagesForDm(messageRef);
  }

  getMessageRefForId(directMessageId: string) {
    return collection(this.firestore, `direct-messages/${directMessageId}/messages`);
  }

  async getMessagesForDm(directMessageId: string): Promise<DmMessage[]> {
    const messageRef = this.getMessageRefForId(directMessageId);
    const q = query(messageRef);
    const querySnapshot = await getDocs(q);

    const messages: DmMessage[] = [];
    querySnapshot.forEach((doc) => {
      messages.push(doc.data() as DmMessage);
    });

    return messages;
  }

  loadMessages() {

  }
}

