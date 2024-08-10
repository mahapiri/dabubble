import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from './../../services/auth.service';
import { Firestore } from '@angular/fire/firestore';
import { User } from '../../../models/user.class';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [MatCardModule, ReactiveFormsModule, MatIcon, RouterLink, CommonModule],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.scss'
})
export class LogInComponent {
  formbuilder: FormBuilder = inject(FormBuilder);
  authService: AuthService = inject(AuthService);
  userService: UserService = inject(UserService)
  firestore: Firestore = inject(Firestore);
  email: string = "";
  mailerrorMessage: string = ""
  passworderrorMessage: string = ""
  invalidMail: boolean = false;
  invalidPassword: boolean = false;
  password: string = "";
  passwordVisible: boolean = false;
  constructor(private router: Router) { }


  userForm = this.formbuilder.group({
    userEmail: ["", Validators.required],
    userPassword: ["", Validators.required]
  })

  async onSubmit() {
    this.email = this.userForm.value.userEmail || '';
    this.password = this.userForm.value.userPassword || '';
    this.invalidMail = false;
    this.invalidPassword = false;

    await this.authService
      .logInUser(this.email, this.password)
      .then(() => {
        this.userForm.reset();
        this.router.navigate(['/main-window']);
      })
      .catch((error) => {
        if (error.code) {
          switch (error.code) {
            case 'auth/invalid-email':
              this.invalidMail = true;
              this.mailerrorMessage = "*Diese E-Mail-Adresse ist leider ungültig"
              break;
            case 'auth/user-not-found':
              this.invalidMail = true;
              this.mailerrorMessage = "Benutzer nicht gefunden"
              break;
            case 'auth/invalid-credential':
              this.invalidPassword = true;
              this.passworderrorMessage = "Falsches Passwort ... Bitte noch einmal versuchen. "
              break;
            case 'auth/missing-password':
              this.invalidPassword = true;
              this.passworderrorMessage = "Bitte geben Sie ein Passwort ein"
              break;
            default:
              console.error('An unknown error occurred:', error.message);
          }
        } else {
          console.error('An unexpected error occurred:', error);
        }
      });
  }

  async logInAsGuest() {
    await this.authService.logInUser("gast@googlemail.com", "123456")
    this.userForm.reset();
    this.router.navigate(['/main-window']);
  }

  showPassword() {
    this.passwordVisible = !this.passwordVisible;
  }

  logOutUser() {
    this.authService.logOut();
  }



}
