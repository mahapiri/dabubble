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
  usermail: string = "";
  username: string = "";
  userpassword: string = "";
  profileImage: string = "";

  constructor(private auth: Auth) { }

  async createUser() {
    await createUserWithEmailAndPassword(this.auth, this.usermail, this.userpassword).then((userCredential) => {
      this.saveUserInDocument(userCredential.user.uid);
    })
  }

  async saveUserInDocument(id: string) {
    this.userService.getUserID();
    await setDoc(doc(this.firestore, "users", id), {
      username: this.username,
      email: this.usermail,
      profileImage: this.profileImage
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
