import { inject, Injectable } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import {
  arrayUnion,
  collection,
  doc,
  Firestore,
  onSnapshot,
  updateDoc,
} from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../../models/user.class';
import { Channel } from '../../models/channel.class';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private auth: Auth) { }
  firestore: Firestore = inject(Firestore);
  public _userChannels = new BehaviorSubject<Channel[]>([]);
  public _userList = new BehaviorSubject<any[]>([]);

  userChannels$: Observable<Channel[]> = this._userChannels.asObservable();
  userList$ = this._userList.asObservable();

  userID: string = '';
  userArray: User[] = [];

  async getUserID() {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.userID = user.uid;
        console.log('User', this.userID, 'is logged in');
        this.setUserState('online');
      } else {
        console.log('User is logged out');
        this.setUserState('offline');
        this.userID = '';
      }
    });
  }

  /* loadChannels() {
    onSnapshot(this.getUserRef(), (doc) => {
      const data = doc.data();
      if (data) {
        const channelIds = data['userChannels'] || [];
        this._userChannels.next(data['userChannels'] || []);
      }
    });
  } */

  getUserList() {
    onSnapshot(collection(this.firestore, 'users'), (querySnapshot) => {
      this.userArray = [];
      querySnapshot.forEach((doc) => {
        let user = new User(doc.data());
        this.userArray.push(user);
      });
      this._userList.next(this.userArray);      
    });
    
  }

  async setUserState(state: string) {
    if (this.userID) {
      await updateDoc(this.getUserRef(), { state: state });
    }
  }

  getUserRef() {
    return doc(this.firestore, 'users', this.userID);
  }

  /** Adds the channels to the User Objekt: when a channel is created to the Creator or when a user gets added to a channel as a member
   * then reloads the channels to update the BehaviorSubject
   */
  updateUserChannels(user: User[], channelID: string) {
    user.forEach(async (user) => {
      await updateDoc(doc(this.firestore, 'users', user.userId), {
        userChannels: arrayUnion(channelID),
      });
    });
  }





}
