import { inject, Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
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
  constructor(private auth: Auth) {}
  firestore: Firestore = inject(Firestore);
  public _userChannels = new BehaviorSubject<Channel[]>([]);
  public _userList = new BehaviorSubject<any[]>([]);

  userChannels$: Observable<Channel[]> = this._userChannels.asObservable();
  userList$ = this._userList.asObservable();

  userID: string = '';
  userArray: User[] = [];
  channelsLoaded: boolean = false;

  getUserID() {
    let user = this.auth.currentUser;
    if (user) {
      this.userID = user.uid;
      console.log('User', this.userID, 'is logged in');
      this.setUserState('online');
      if (!this.channelsLoaded) {
        this.channelsLoaded = true;
        //this.loadChannels();
      }
    } else {
      console.log('User is logged out');
      this.setUserState('offline');
      this.userID = '';
    }
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

  setUserState(state: string) {
    if (this.userID) {
      updateDoc(this.getUserRef(), { state: state });
    }
  }

  getUserRef() {
    return doc(this.firestore, 'users', this.userID);
  }

  /** Adds the channels to the User Objekt: when a channel is created to the Creator or when a user gets added to a channel as a member
   * then reloads the channels to update the BehaviorSubject
   */
  updateUserChannels(userID: string, channelID: string) {
    const userRef = doc(this.firestore, 'users', userID);
    updateDoc(userRef, {
      userChannels: arrayUnion(channelID),
    }); /* .then(() => {
      //this.loadChannels();
    }); */
  }
}
