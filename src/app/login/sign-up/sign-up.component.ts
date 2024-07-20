import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [MatCardModule, MatIconModule, ReactiveFormsModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent {
  formbuilder: FormBuilder = inject(FormBuilder);

  userForm = this.formbuilder.group({
    userName: [""],
    userEmail: [""],
    userPassword: [""]
  })

  showInfos(){
    console.log(this.userForm.value);
    
  }


}

