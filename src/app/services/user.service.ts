import { inject, Injectable } from '@angular/core';
import { Auth, deleteUser, onAuthStateChanged } from '@angular/fire/auth';
import {
  arrayUnion,
  collection,
  doc,
  Firestore,
  onSnapshot,
  updateDoc,
} from '@angular/fire/firestore';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { User } from '../../models/user.class';
import { Channel } from '../../models/channel.class';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  firestore: Firestore = inject(Firestore);
  public _userChannels = new BehaviorSubject<Channel[]>([]);
  public _userList = new BehaviorSubject<any[]>([]);

  userChannels$: Observable<Channel[]> = this._userChannels.asObservable();
  userList$ = this._userList.asObservable();

  private currentUser = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUser.asObservable();

  userID: string = '';
  userArray: User[] = [];
  public authStateSubscription: Subscription | undefined;
  private unsubscribeSnapshot: (() => void) | undefined;

  constructor(private auth: Auth) {}

  async getUserID() {
    this.authStateSubscription = new Subscription();
    const authStateChangeHandler = onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.userID = user.uid;
        console.log('User', this.userID, 'is logged in');
        this.getCurrentUser();
        this.setUserState('online');
      } else {
        console.log('User is logged out');
        this.setUserState('offline');
        this.userID = '';
        this.currentUser.next(null);
      }
    });
    this.authStateSubscription.add(authStateChangeHandler);
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

  getCurrentUser() {
    this.unsubscribeSnapshot = onSnapshot(
      this.getUserRef(),
      (user) => {
        if (user.exists()) {
          this.currentUser.next(new User(user.data()));         
        }
      },
      (error) => {
        console.error('Error getting current user:', error);
        this.currentUser.next(null);
      }
    );
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

  unsubscribe() {
    if (this.unsubscribeSnapshot) {
      this.unsubscribeSnapshot();
    }
  }
}
