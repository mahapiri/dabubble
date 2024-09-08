import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { AuthService } from './../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [MatCardModule, MatIconModule, ReactiveFormsModule, MatIcon, RouterLink, CommonModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent {
  formbuilder: FormBuilder = inject(FormBuilder);
  authService: AuthService = inject(AuthService);
  passwordVisible: boolean = false;
  passwordErrorMessage: string = "";
  mailerrorMessage: string = "";
  nameErrorMessage: string = "";
  termsErrorMessage: string = "";
  invalidName: boolean = false;
  invalidMail: boolean = false;
  invalidPassword: boolean = false;
  invalidTerms: boolean = false;
  constructor(private router: Router) { }

  userForm = this.formbuilder.group({
    userName: ["", Validators.required],
    userEmail: ["", [Validators.required, Validators.email]],
    userPassword: ["", [Validators.required, Validators.minLength(6)]],
    termsAccepted: [false, Validators.requiredTrue]
  })



  /**
 * saves the user credentials in the authService if they are correct or throws an errormessage if they are incorrect
 */
  async onSubmit() {
    this.invalidName = false;
    this.invalidMail = false;
    this.invalidPassword = false;
    this.invalidTerms = false;
    if (this.userForm.valid) {
      this.authService.usermail = this.userForm.value.userEmail || "";
      this.authService.username = this.userForm.value.userName || "";
      this.authService.userpassword = this.userForm.value.userPassword || "";
      this.router.navigate(['/choose-avatar']);
    } else {
      if (this.userForm.get('userName')?.invalid) {
        this.invalidName = true;
        this.nameErrorMessage = "Bitte geben Sie einen Namen ein";
      }
      if (this.userForm.get('userEmail')?.invalid) {
        this.invalidMail = true;
        this.mailerrorMessage = "Bitte geben Sie eine gültige Mailadresse ein";
      }
      if (this.userForm.get('userPassword')?.invalid) {
        this.invalidPassword = true;
        this.passwordErrorMessage = "Ihr Passwort sollte mindestens 6 Zeichen lang sein";
      }
      if (this.userForm.get('termsAccepted')?.invalid) {
        this.invalidTerms = true;
        this.termsErrorMessage = "Bitte stimmen Sie den Datenschutzbestimmungen zu";
      }
    }
  }

  /**
 * toggles the password visibility
 */
  showPassword() {
    this.passwordVisible = !this.passwordVisible;
  }
}



