import { Component, inject } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {
  Auth,
  confirmPasswordReset,
  signInWithEmailAndPassword,
  updatePassword,
  verifyPasswordResetCode,
} from '@angular/fire/auth';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [MatCardModule, MatIconModule, ReactiveFormsModule, RouterLink, CommonModule, MatIcon],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent {
  constructor(private router: Router, private auth: Auth) { }


  formbuilder: FormBuilder = inject(FormBuilder);
  authService: AuthService = inject(AuthService);
  userService: UserService = inject(UserService);
  actionCode: string | null = '';
  passwordsNotMatching: boolean = false;
  passwordVisible: boolean = false;
  userForm = this.formbuilder.group({
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    newPasswordConfirm: ['', [Validators.required, Validators.minLength(6)]],
  });

  /**
   * get action code from reset-password email
   */
  ngOnInit(): void {
    this.actionCode = this.getParameterByName('oobCode');
  }

  /**
   * extracts the oobCode from the email-url
   * @param name 
   * @returns oob-code
   */
  getParameterByName(name: string): string | null {
    const url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    const results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

  /**
   * uses the action code to reset the password 
   */
  async onSubmit() {
    if (this.actionCode) {
      this.handleResetPassword(this.auth, this.actionCode);
    }
  }

  /**
   * verifies the action code; resets the password with the one the user has typed in; logs in the user with the new password
   * @param auth 
   * @param actionCode 
   */
  handleResetPassword(auth: Auth, actionCode: string) {
    verifyPasswordResetCode(auth, actionCode).then((email) => {
      const newPassword = this.userForm.value.newPassword;
      this.checkMatchingPassword();
      if (newPassword && !this.passwordsNotMatching) {
        confirmPasswordReset(auth, actionCode, newPassword).then(async (resp) => {
          await signInWithEmailAndPassword(this.auth, email, newPassword);
          this.router.navigate(['/main-window']);
        })
          .catch((error) => {
            console.error('Link expired. Please try again');
          });
      }
    })
      .catch((error) => {
        console.error('Link expired or action Code not correct. Please try again');
      });
  }

  /**
   * Checks if the new password and confirmation password fields match.
   */
  checkMatchingPassword(){
    if (this.userForm.value.newPassword === this.userForm.value.newPasswordConfirm) {
      this.passwordsNotMatching = false
    }
    else{
      this.passwordsNotMatching = true
    }
  }

  /**
   * Toggles the visibility of the password field.
   */
  showPassword() {
    this.passwordVisible = !this.passwordVisible;
  }
}
