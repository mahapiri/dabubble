import { inject, Injectable } from '@angular/core';
import { doc, Firestore, getDoc } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private firestore: Firestore = inject(Firestore);
  isProfile: boolean = false;
  isMyProfile: boolean = false;

  private profileSubject = new BehaviorSubject<any>(null);
  profile$ = this.profileSubject.asObservable();

  private selectProfileSubject = new BehaviorSubject<boolean>(false);
  selectProfileChange$ = this.selectProfileSubject.asObservable();

  private clickedThreadSubject = new BehaviorSubject<boolean>(false);
  clickedThread$ = this.clickedThreadSubject.asObservable();

  private clickedAnswerSubject = new BehaviorSubject<boolean>(false);
  clickedAnswer$ = this.clickedAnswerSubject.asObservable();

  private isNewMessageSubject = new BehaviorSubject<boolean>(false);
  isNewMessage$ = this.isNewMessageSubject.asObservable();

  private clickedNewMessageSubject = new BehaviorSubject<boolean>(false);
  clickedNewMessage$ = this.clickedNewMessageSubject.asObservable();

  private selectedUserIndexSubject = new BehaviorSubject<number | null>(null);
  selectedUserIndex$ = this.selectedUserIndexSubject.asObservable();

  isProfileID: string = '';
  isMyProfileID: string = '';
  isResults: boolean = false;

  constructor() {}

  /**
   * Opens the profile of a user and fetches the profile data from Firestore.
   * @param {string} userID - The ID of the user whose profile needs to be opened.
   */
  openProfile(userID: string) {
    this.isProfile = true;
    this.isProfileID = userID;
    this.getProfile(userID);
  }

  /**
   * Opens the profile of the current user and fetches the profile data from Firestore.
   * @param {string} userID - The ID of the current user.
   */
  openMyProfile(userID: string) {
    this.isMyProfile = true;
    this.isMyProfileID = userID;
    this.getProfile(userID);
  }

  /**
   * Fetches the profile data of the user from Firestore and updates the profile subject.
   * @param {string} userID - The ID of the user whose profile data needs to be fetched.
   */
  async getProfile(userID: string) {
    const docRef = doc(this.firestore, `users/${userID}`);
    const userSnap = await getDoc(docRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      this.profileSubject.next(data);
    }
  }

  /**
   * Sets the state of whether a profile is selected or not.
   * @param {boolean} state - The state to set for the selected profile.
   */
  setSelectProfile(state: boolean) {
    this.selectProfileSubject.next(state);
  }

  /**
   * Sets whether an answer was clicked or not.
   * @param {boolean} value - The value indicating if an answer was clicked.
   */
  setAnswerClicked(value: boolean) {
    this.clickedAnswerSubject.next(value);
  }

  /**
   * Gets the current state of whether there is a new message.
   * @returns {boolean} - The current state of new messages.
   */
  getIsNewMessage(): boolean {
    return this.isNewMessageSubject.getValue();
  }

  /**
   * Sets the state of whether there is a new message.
   * @param {boolean} value - The value indicating if there is a new message.
   */
  setIsNewMessage(value: boolean) {
    this.isNewMessageSubject.next(value);
  }

  /**
   * Gets the current state of whether the new message button was clicked.
   * @returns {boolean} - The current state of the new message button click.
   */
  getClickedNewMessage(): boolean {
    return this.clickedNewMessageSubject.getValue();
  }

  /**
   * Sets the state of whether the new message button was clicked.
   * @param {boolean} value - The value indicating if the new message button was clicked.
   */
  setClickedNewMessage(value: boolean) {
    this.clickedNewMessageSubject.next(value);
  }

  /**
   * Sets the state of whether a thread was clicked.
   * @param {boolean} value - The value indicating if a thread was clicked.
   */
  async setClickedThread(value: boolean) {
    this.clickedThreadSubject.next(value);
  }

  /**
   * Toggles the state of whether the new message button was clicked.
   */
  toggleClickedNewMessage() {
    const currentValue = this.getClickedNewMessage();
    this.setClickedNewMessage(!currentValue);
  }

  /**
   * Sets the index of the selected user.
   * @param {number} i - The index of the selected user.
   */
  setSelectedUserIndex(i: any) {
    this.selectedUserIndexSubject.next(i);
  }

  /**
   * Resets the selected user index to null.
   */
  resetSelectedUserIndex() {
    this.selectedUserIndexSubject.next(null);
  }
}
