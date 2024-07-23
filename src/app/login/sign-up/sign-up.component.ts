import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { AuthService } from './../../services/auth.service';
import { User } from '../../../models/user.class';
import { Firestore } from '@angular/fire/firestore';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [MatCardModule, MatIconModule, ReactiveFormsModule, MatIcon, RouterLink],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent {
  formbuilder: FormBuilder = inject(FormBuilder);
  authService: AuthService = inject(AuthService);
  firestore: Firestore = inject(Firestore);
  passwordVisible: boolean = false;

  user: User = new User();


  userForm = this.formbuilder.group({
    userName: ["", Validators.required],
    userEmail: ["", [Validators.required, Validators.email]],
    userPassword: ["", Validators.required]
  })


  onSubmit() {
    this.user.email = this.userForm.value.userEmail || "";
    this.user.fullName = this.userForm.value.userName || "";
    this.user.password = this.userForm.value.userPassword || "";
    this.authService.createUser(this.user.email, this.user.password)
    this.userForm.reset();
  }

  showPassword() {
    this.passwordVisible = !this.passwordVisible;
  }




}



