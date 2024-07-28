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
  userArray: any[] = [];
  channelsLoaded: boolean = false;


  getUserID() {
    let user = this.auth.currentUser;
    if (user) {
      this.userID = user.uid;
      console.log("User", this.userID, "is logged in");
      this.setUserState("online")
      if (!this.channelsLoaded) {
        this.channelsLoaded = true
        this.loadChannels()
      }
    } else {
      console.log("User is logged out");
      this.setUserState("offline")
      this.userID = "";
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

  setUserState(state: string) {
    updateDoc(this.getUserRef(), { state: state });
  }

  getUserList() {
    onSnapshot(collection(this.firestore, "users"), (querySnapshot) => {
      this.userArray = [];
      querySnapshot.forEach((doc) => {
        this.userArray.push(
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



