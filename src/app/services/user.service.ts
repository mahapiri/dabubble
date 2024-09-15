import { inject, Injectable } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import {
  arrayUnion,
  collection,
  doc,
  Firestore,
  getDoc,
  onSnapshot,
  updateDoc,
} from '@angular/fire/firestore';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { User } from '../../models/user.class';
import { Channel } from '../../models/channel.class';

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

  /**
   * gets the userId from the current, logged-in, user and sets the state ro onlinee, or offline.
   * sets the current-user-Observable to the current user
   */
  async getUserID() {
    this.authStateSubscription = new Subscription();
    const authStateChangeHandler = onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.userID = user.uid;
        // console.log('User', this.userID, 'is logged in');
        this.getCurrentUser();
        this.setUserState('online');
      } else {
        // console.log('User is logged out');
        this.setUserState('offline');
        this.userID = '';
        this.currentUser.next(null);
      }
    });
    this.authStateSubscription.add(authStateChangeHandler);
  }

  /**
   * get an observable of all the user-Objects, that are saved in the database
   */
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

  /**
   * gives the current User Object to the current-user-observable
   */
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

  /**
   * sets the state of the user in the document to online or offline
   * @param state the state to set ("Online", or "Offline")
   */
  async setUserState(state: string) {
    if (this.userID) {     
      await updateDoc(this.getUserRef(), { state: state });
    }
    else{
      console.log("couldnt set user state");
      
    }
  }

  /**
   * gets the firestore reference of the current user
   * @returns firestore reference
   */
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

  /**
   * unsubscribes from the current-user-snapshot
   */
  unsubscribe() {
    if (this.unsubscribeSnapshot) {
      this.unsubscribeSnapshot();
    }
  }

  /**
   * Retrieves a user document by its ID from the `users` collection from Firestore.
   * @param {string} userID - The ID of the user to retrieve.
   * @returns {Promise<User | undefined>} A promise that resolves to a `User` object if the document exists, or `undefined` if it does not.
   */
  async getUserById(userID: string) {
    const userRef = doc(this.firestore, 'users', userID);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      return new User(userDoc.data());
    } else {
      return undefined;
    }
  }
}
