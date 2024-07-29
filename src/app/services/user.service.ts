import { inject, Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {
  collection,
  doc,
  Firestore,
  onSnapshot,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { User } from '../../models/user.class';


@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private auth: Auth) { }
  firestore: Firestore = inject(Firestore);
  public _userChannels = new BehaviorSubject<string[]>([]);
  userChannels$ = this._userChannels.asObservable();
  public _userList = new BehaviorSubject<any[]>([]);
  userList$ = this._userList.asObservable();
  userID: string = '';
  userArray: any[] = [];
  channelsLoaded: boolean = false;


  getUserID() {
    let user = this.auth.currentUser;
    if (user) {
      this.userID = user.uid;
      console.log('User', this.userID, 'is logged in');
      this.setUserState('online');
      if (!this.channelsLoaded) {
        this.channelsLoaded = true;
        this.loadChannels();
      }
    } else {
      console.log('User is logged out');
      this.setUserState('offline');
      this.userID = '';
    }
  }


  loadChannels() {
    onSnapshot(this.getUserRef(), (doc) => {
      const data = doc.data();
      if (data) {
        this._userChannels.next(data['userChannels']);

      }
    });
  }

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
    updateDoc(this.getUserRef(), { state: state });
  }

  getUserRef() {
    return doc(this.firestore, 'users', this.userID);
  }
}
