import { inject, Injectable } from '@angular/core';
import { UserService } from './user.service';
import { addDoc, collection, doc, Firestore, getDocs, setDoc, where, query } from '@angular/fire/firestore';
import { User } from '../../models/user.class';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DirectMessageService {
  private firestore: Firestore = inject(Firestore);
  private userService: UserService = inject(UserService);
  private userSubject = new BehaviorSubject<User | null>(null);
  public userSelected$ = this.userSubject.asObservable();

  constructor() { }

  getActualProfile(profile: User) {
    this.userSubject.next(profile);
  }

  async addDirectMessage(profile: User) {
    const currentUserId = this.getCurrentUserID();
    const existingDmId = await this.proofExistingDm(currentUserId, profile.userId);

    if (!existingDmId) {
      const messageRef = await addDoc(collection(this.firestore, 'direct-messages'), {
        userIDs: [profile.userId, currentUserId],
        messages: [],
      });
      await this.setDirectMessageID(messageRef.id);
    } else {
      console.log('Direct Message Channel already exists:', existingDmId);
    }
  }

  async setDirectMessageID(id: string) {
    const docRef = doc(this.getCollectionRef(), id);
    await setDoc(docRef, {
      directMessageID: id,
    }, {merge: true});
  }

  getCollectionRef() {
    return collection(this.firestore, 'direct-messages');
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
      if (userIds.includes(otherUserId) && userIds.includes(currentUserId)) {
        return doc.id;
      }
    }
    return null;
  }
}

  