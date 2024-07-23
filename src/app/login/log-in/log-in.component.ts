import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from './../../services/auth.service';
import { Firestore } from '@angular/fire/firestore';
import { User } from '../../../models/user.class';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [MatCardModule, ReactiveFormsModule, MatIcon, RouterLink],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.scss'
})
export class LogInComponent {
  formbuilder: FormBuilder = inject(FormBuilder);
  authService: AuthService = inject(AuthService);
  firestore: Firestore = inject(Firestore);
  user: User = new User();
  passwordVisible: boolean = false;

  userForm = this.formbuilder.group({
    userEmail: ["", Validators.required],
    userPassword: ["", Validators.required]
  })

  onSubmit() {
    this.user.email = this.userForm.value.userEmail || "";
    this.user.password = this.userForm.value.userPassword || "";
    this.authService.logInUser(this.user.email, this.user.password);
    this.userForm.reset();
  }

  logInAsGuest() {
    this.authService.logInUser("gast@googlemail.com", "123456")
    this.userForm.reset();
  }

  showPassword() {
    this.passwordVisible = !this.passwordVisible;
  }

  logOutUser(){
    this.authService.logOut();
  }



}
