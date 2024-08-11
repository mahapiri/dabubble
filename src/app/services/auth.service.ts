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
  state: string = "";
  userId: string = "";

  constructor(private auth: Auth) { }

  async createUser() {
    await createUserWithEmailAndPassword(this.auth, this.usermail, this.userpassword).then((userCredential) => {
      this.saveUserInDocument(userCredential.user.uid);
      this.userId = userCredential.user.uid;
    })
  }

  async saveUserInDocument(id: string) {
    this.userService.getUserID();
    await setDoc(doc(this.firestore, "users", id), {
      username: this.username,
      email: this.usermail,
      profileImage: this.profileImage,
      userChannels: ["Entwicklerteam", "Office-Team"],
      state: this.state,
      userId: id
    });
  }


  async logInUser(mail: string, password: string) {
    await signInWithEmailAndPassword(this.auth, mail, password)
  }

  async logOut() {
    this.userService.getUserID();
    await signOut(this.auth);
    this.userService.getUserID();
  }
}
