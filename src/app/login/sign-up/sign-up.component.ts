import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../user.service';
import { User } from '../../../models/user.class';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';


@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [MatCardModule, MatIconModule, ReactiveFormsModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent {
  formbuilder: FormBuilder = inject(FormBuilder);
  userService: UserService = inject(UserService);
  firestore: Firestore = inject(Firestore);

  user: User = new User();


  userForm = this.formbuilder.group({
    userName: ["", Validators.required],
    userEmail: ["", [Validators.required, Validators.email]],
    userPassword: ["", Validators.required]
  })

  constructor(private auth: Auth) {

  }

  onSubmit() {
    this.user.email = this.userForm.value.userEmail || "";
    this.user.fullName = this.userForm.value.userName || "";
    this.user.password = this.userForm.value.userPassword || "";
    this.userService.saveCurrentUser(this.user);
    this.createUser();
  }

  createUser() {
    createUserWithEmailAndPassword(this.auth, this.user.email, this.user.password).then((userCredential) => {
      console.log("User created:", userCredential.user);
      this.userForm.reset();
    });
  }



}



