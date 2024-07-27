import { inject, Injectable } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { doc, Firestore, onSnapshot } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  firestore: Firestore = inject(Firestore)
  public _userChannels = new BehaviorSubject<string[]>([]);
  userChannels$ = this._userChannels.asObservable();
  constructor(private auth: Auth) { }
  userID: string = "";


  getUserID() {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.userID = user.uid;
        console.log("User", this.userID, "is logged in");
        this.loadChannels();
      } else {
        console.log("User is logged out");
        this.userID = "";
      }
    });
  }


  loadChannels() {
    onSnapshot(doc(this.firestore, 'users', this.userID), (doc) => {
      const data = doc.data();
      if (data) {
        this._userChannels.next(data['userChannels']);
        console.log('Current data: ', this._userChannels.value);

      }
    });
  }


  // getUserRef() {
  //    return doc(this.firestore, 'users', this.userID)
  // }
}



