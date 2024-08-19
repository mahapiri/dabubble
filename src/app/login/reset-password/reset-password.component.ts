import { Component, inject } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Auth, updatePassword } from '@angular/fire/auth';
import { UserService } from '../../services/user.service';


@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [MatCardModule, MatIconModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent {
  constructor(private router: Router, private auth: Auth) { }

  formbuilder: FormBuilder = inject(FormBuilder)
  authService: AuthService = inject(AuthService);
  userService: UserService = inject(UserService)

  userForm = this.formbuilder.group({
    newPassword: ["", [Validators.required, Validators.minLength(6)]],
    newPasswordConfirm: ["", [Validators.required, Validators.minLength(6)]]
  })

  ngOnInit() {
    console.log(this.userService.currentUser$, this.authService.currentUser, this.auth.currentUser);

  }
  async onSubmit() {

    this.authService.userpassword = this.userForm.value.newPassword || '';

    /*    updatePassword(user, newPassword).then(() => {
         // Update successful.
       }).catch((error) => {
         // An error ocurred
         // ...
       }); */
    this.router.navigate(['/main-window']);

  }

}




