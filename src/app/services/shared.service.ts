import { inject, Injectable } from '@angular/core';
import { UserService } from './user.service';
import { doc, Firestore, getDoc } from '@angular/fire/firestore';
import { User } from '../../models/user.class';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private firestore: Firestore = inject(Firestore);
  isProfile: boolean = false;

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
  isResults: boolean = false;

  constructor() {}

  openProfile(userID: string) {
    this.isProfile = true;
    this.isProfileID = userID;
    this.getProfile(userID);
  }

  async getProfile(userID: string) {
    const docRef = doc(this.firestore, `users/${userID}`);
    const userSnap = await getDoc(docRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      this.profileSubject.next(data);
    }
  }

  setSelectProfile(state: boolean) {
    this.selectProfileSubject.next(state);
  }

  setAnswerClicked(value: boolean) {
    this.clickedAnswerSubject.next(value);
  }

  getIsNewMessage(): boolean {
    return this.isNewMessageSubject.getValue();
  }

  setIsNewMessage(value: boolean) {
    this.isNewMessageSubject.next(value);
  }

  getClickedNewMessage(): boolean {
    return this.clickedNewMessageSubject.getValue();
  }

  setClickedNewMessage(value: boolean) {
    this.clickedNewMessageSubject.next(value);
  }

  async setClickedThread(value: boolean) {
    this.clickedThreadSubject.next(value);
  }

  toggleClickedNewMessage() {
    const currentValue = this.getClickedNewMessage();
    this.setClickedNewMessage(!currentValue);
  }

  setSelectedUserIndex(i: any) {
    this.selectedUserIndexSubject.next(i);
  }

  resetSelectedUserIndex() {
    this.selectedUserIndexSubject.next(null);
  }
}
