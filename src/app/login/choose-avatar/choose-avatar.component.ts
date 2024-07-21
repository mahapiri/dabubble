import { Component } from '@angular/core';
import {MatCardModule} from '@angular/material/card'; 
import {MatIconModule} from '@angular/material/icon'; 



@Component({
  selector: 'app-choose-avatar',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  templateUrl: './choose-avatar.component.html',
  styleUrl: './choose-avatar.component.scss'
})
export class ChooseAvatarComponent {

}
