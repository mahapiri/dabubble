import { inject, Injectable } from '@angular/core';
import { User } from '../../models/user.class';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { UserService } from './user.service';
import { arrayUnion, doc, Firestore, getDoc, setDoc, updateDoc } from '@angular/fire/firestore';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  currentUser: User = new User;
  userService: UserService = inject(UserService);
  firestore: Firestore = inject(Firestore);
  provider = new GoogleAuthProvider();
  usermail: string = "";
  username: string = "";
  userpassword: string = "";
  profileImage: string | ArrayBuffer | null = "";
  state: string = "online";
  userId: string = "";

  constructor(private auth: Auth) { }

  async createUser() {
    await createUserWithEmailAndPassword(this.auth, this.usermail, this.userpassword).then(async (userCredential) => {
      this.userId = userCredential.user.uid;
    })
  }

  async saveUserInDocument() {
    this.userService.getUserID();
    await setDoc(doc(this.firestore, "users", this.userId), this.setUser());
  }

  async setStartingChannels() {
    await updateDoc(doc(this.firestore, 'channels', 'HRyA2fYZpKKap6d1sJS0'), {
      channelMember: arrayUnion(this.setUser())
    });
    await updateDoc(doc(this.firestore, 'channels', '3cxTzZ2xWpatlmxNOpbf'), {
      channelMember: arrayUnion(this.setUser())
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

  async googleLogin() {
    await signInWithPopup(this.auth, this.provider).then((result) => {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential) {
        this.userId = result.user.uid;
        this.setGoogleUser(result.user);
      }
    }).catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.customData.email;
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
      // ...
    });
  }

  setGoogleUser(user: any) {
    this.username = user.displayName;
    this.usermail = user.email;
    this.profileImage = user.photoURL ?? "assets/img/character-empty.png";
    this.lookForGoogleUserInDatabase(user.uid)
  }


  async lookForGoogleUserInDatabase(userid: string) {
    const userdoc = await getDoc(doc(this.firestore, "users", userid))
    if (!userdoc.exists()) {
      await this.setStartingChannels()
      await this.saveUserInDocument()
    }
  }

  setUser() {
    return {
      username: this.username,
      email: this.usermail,
      profileImage: this.profileImage,
      userChannels: ["HRyA2fYZpKKap6d1sJS0", "3cxTzZ2xWpatlmxNOpbf"],
      state: this.state,
      userId: this.userId
    }
  }
}
