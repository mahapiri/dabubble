import { Component, inject } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Auth, sendPasswordResetEmail } from '@angular/fire/auth';
import { UserService } from '../../services/user.service';


@Component({
  selector: 'app-send-mail',
  standalone: true,
  imports: [MatCardModule, MatIconModule, ReactiveFormsModule, RouterLink],
  templateUrl: './send-mail.component.html',
  styleUrl: './send-mail.component.scss',
})
export class SendMailComponent {
  formbuilder: FormBuilder = inject(FormBuilder)
  authService: AuthService = inject(AuthService);
  constructor(private auth: Auth) { }

  userForm = this.formbuilder.group({
    email: ["", [Validators.required]],
  })



  onSubmit() {
    this.authService.usermail = this.userForm.value.email || '';
    sendPasswordResetEmail(this.auth, this.authService.usermail)
      .then(() => {
        console.log("Email-send to ", this.authService.currentUser)
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
      });
  }





}
