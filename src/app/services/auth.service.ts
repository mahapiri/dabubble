import { inject, Injectable } from '@angular/core';
import { User } from '../../models/user.class';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { UserService } from './user.service';
import { doc, Firestore, setDoc, updateDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  currentUser: User = new User;
  userService: UserService = inject(UserService);
  firestore: Firestore = inject(Firestore)
  displayedUserName: string = "";
  //currentUserId: string = "";

  constructor(private auth: Auth) { }

  async createUser(mail: string, password: string, username: string) {
    await createUserWithEmailAndPassword(this.auth, mail, password).then((userCredential) => {
      this.saveUserInDocument(mail, username, userCredential.user.uid);
      this.displayedUserName = username;
     // this.currentUserId = userCredential.user.uid;
    })
  }

  async saveUserInDocument(mail: string, name: string, id: string) {
    await setDoc(doc(this.firestore, "users", id), {
      username: name,
      email: mail,
    });
  }

  async saveProfilepictureInDoc(profilePictureURL: string) {
    await this.userService.getUserID();
    await updateDoc(doc(this.firestore, "users", this.userService.userID), {
      profileImage: profilePictureURL
    });
  }


  logInUser(mail: string, password: string) {
    signInWithEmailAndPassword(this.auth, mail, password)
      .then(() => {
        this.userService.getUserID();
      })
      .catch((error) => {
        const errorMessage = error.message;
        console.warn(errorMessage);

      });
  }

  logOut() {
    signOut(this.auth).then().catch((error) => {
      console.log(error);
    });
  }
}
