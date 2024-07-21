import { Injectable } from '@angular/core';
import { User } from '../models/user.class';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  currentUser: User = new User;

  constructor() {

  }

  saveCurrentUser(user: User) {
    this.currentUser = user;
    console.log("Current User is:", user);

  }
}
