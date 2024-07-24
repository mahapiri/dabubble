import { inject, Injectable } from '@angular/core';
import { User } from '../../models/user.class';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { UserService } from './user.service';
import { doc, Firestore, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  currentUser: User = new User;
  userService: UserService = inject(UserService);
  firestore: Firestore = inject(Firestore)

  constructor(private auth: Auth) { }

  async createUser(mail: string, password: string, username: string) {
    await createUserWithEmailAndPassword(this.auth, mail, password).then((userCredential) => {
      this.saveUserInDocument(mail, username, userCredential.user.uid)
    })
  }

  async saveUserInDocument(mail: string, name: string, id: string) {
    await setDoc(doc(this.firestore, "users", id), {
      username: name,
      email: mail,
    });
  }


  saveCurrentUser(user: User) {
    this.currentUser = user;
    console.log("Current User is:", user);
  }

  logInUser(mail: string, password: string) {
    signInWithEmailAndPassword(this.auth, mail, password)
      .then((userCredential) => {
        const user = userCredential.user;
        this.userService.getUserID();
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorMessage);

      });
  }

  logOut() {
    signOut(this.auth).then().catch((error) => {
      console.log(error);

    });
  }
}
