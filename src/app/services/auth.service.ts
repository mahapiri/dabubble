import { inject, Injectable } from '@angular/core';
import { User } from '../../models/user.class';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  currentUser: User = new User;
  userService: UserService = inject(UserService);

  constructor(private auth: Auth) { }

  createUser(mail: string, password: string) {
    createUserWithEmailAndPassword(this.auth, mail, password).then((userCredential) => {
      console.log("User created:", userCredential.user);
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

  logOut(){
    signOut(this.auth).then().catch((error) => {
      console.log(error);
      
    });
  }
}
