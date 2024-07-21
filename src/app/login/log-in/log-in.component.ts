import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { UserService } from '../../user.service';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { User } from '../../../models/user.class';

@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [MatCardModule, ReactiveFormsModule],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.scss'
})
export class LogInComponent {
  formbuilder: FormBuilder = inject(FormBuilder);
  userService: UserService = inject(UserService);
  firestore: Firestore = inject(Firestore);
  user: User = new User();

  constructor(private auth: Auth) {

  }

  userForm = this.formbuilder.group({
    userEmail: ["", Validators.required],
    userPassword: ["", Validators.required]
  })

  guestEmail: string = "gast@gast.de";
  guestPassword: string = "123456";

  onSubmit() {
    this.user.email = this.userForm.value.userEmail || "";
    this.user.password = this.userForm.value.userPassword || "";
    this.userService.saveCurrentUser(this.user);
    this.logInUser();
  }

  logInUser() {
    signInWithEmailAndPassword(this.auth, this.user.email, this.user.password)
      .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        console.log("logged in as user: ", user);
        this.userForm.reset();
        
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
      });
  }

  logInAsGuest() {
    signInWithEmailAndPassword(this.auth, this.guestEmail, this.guestPassword)
      .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        console.log("logged in as guest: ", user);
        this.userService.currentUser.email = "gast@gast.de";
        this.userService.currentUser.password = "123456";
        this.userForm.reset();
        
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
      });
  }





}
