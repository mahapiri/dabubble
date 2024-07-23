import { Injectable } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private auth: Auth) { }
  userID: string = "";


  getUserID() {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.userID = user.uid;
        console.log("User", this.userID, "is logged in");
      } else {
        console.log("User is logged out");
        this.userID = "";
      }
    });
  }


}
