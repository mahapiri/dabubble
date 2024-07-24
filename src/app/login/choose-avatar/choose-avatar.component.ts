import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';



@Component({
  selector: 'app-choose-avatar',
  standalone: true,
  imports: [MatCardModule, MatIconModule, RouterLink],
  templateUrl: './choose-avatar.component.html',
  styleUrl: './choose-avatar.component.scss'
})
export class ChooseAvatarComponent {
  authService: AuthService = inject(AuthService)
  constructor(private router: Router) { }


  username: string = this.authService.displayedUserName;
  imgURL: string = "assets/img/character-empty.png";

  setPicture(src: string) {
    this.imgURL = src;
  }

  async createUserImage(){
    await this.authService.saveProfilepictureInDoc(this.imgURL);
    this.router.navigate(['/main-window']);
  }


}
