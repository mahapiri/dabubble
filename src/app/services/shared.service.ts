import { inject, Injectable } from '@angular/core';
import { UserService } from './user.service';
import { doc, Firestore, getDoc } from '@angular/fire/firestore';
import { User } from '../../models/user.class';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private firestore: Firestore = inject(Firestore);
  isProfile: boolean = false;

  private profileSubject = new BehaviorSubject<any>(null);
  profile$ = this.profileSubject.asObservable();

  private selectProfileSubject = new BehaviorSubject<boolean>(false);
  selectProfileChange$ = this.selectProfileSubject.asObservable();


  isProfileID: string = '';
  isResults: boolean = false;


  constructor() { }

  
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
}
