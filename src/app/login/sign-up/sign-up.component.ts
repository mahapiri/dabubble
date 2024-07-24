import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { AuthService } from './../../services/auth.service';
import { Router, RouterLink } from '@angular/router';


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
  passwordVisible: boolean = false;
  constructor(private router: Router) { }

  userForm = this.formbuilder.group({
    userName: ["", Validators.required],
    userEmail: ["", [Validators.required, Validators.email]],
    userPassword: ["", Validators.required]
  })

  async onSubmit() {

    if (this.userForm.valid) {
      this.authService.usermail = this.userForm.value.userEmail || "";
      this.authService.username = this.userForm.value.userName || "";
      this.authService.userpassword = this.userForm.value.userPassword || "";
      this.router.navigate(['/choose-avatar']);
    }

  }

  showPassword() {
    this.passwordVisible = !this.passwordVisible;
  }
}



