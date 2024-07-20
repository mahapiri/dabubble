import { Component } from '@angular/core';
import {MatCardModule} from '@angular/material/card'; 
import {MatIconModule} from '@angular/material/icon'; 

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent {

}
