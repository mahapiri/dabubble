import { inject, Injectable } from '@angular/core';
import { Auth, onAuthStateChanged, Unsubscribe } from '@angular/fire/auth';
import { collection, doc, Firestore, onSnapshot, setDoc, updateDoc } from '@angular/fire/firestore';
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
  public unsubChannel: Unsubscribe | undefined;
  public unsubUserlist: Unsubscribe | undefined;


  getUserID() {
    let user = this.auth.currentUser;
    if (user) {
      this.userID = user.uid;
      console.log("User", this.userID, "is logged in");
      this.setUserState("online")
    } else {
      console.log("User is logged out");
      this.setUserState("offline")
      this.userID = "";
    }
  }

  loadChannels() {
    this.unsubChannel = onSnapshot(this.getUserRef(), (doc) => {
      const data = doc.data();
      if (data) {
        this._userChannels.next(data['userChannels']);
        console.log('Current data: ', this._userChannels.value);
      }
    });
  }

  setUserState(state: string) {
    updateDoc(this.getUserRef(), { state: state });
  }

  getUserList(userArray: any[]) {
    this.unsubUserlist = onSnapshot(collection(this.firestore, "users"), (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        userArray.push(
          {
            name: doc.data()['username'],
            img: doc.data()['profileImage'],
            status: doc.data()['state']
          }
        );
      });
    });
  }


  getUserRef() {
    return doc(this.firestore, 'users', this.userID)
  }


}



