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
  pictureChosen: boolean = false;
  constructor(private router: Router) { }


  username: string = this.authService.username;
  imgURL: string = "assets/img/character-empty.png";

  setPicture(src: string) {
    this.pictureChosen = true;
    this.imgURL = src;
    this.authService.profileImage = src;
  }

  async createUser(){
    await this.authService.createUser();
    this.pictureChosen = false;
    this.router.navigate(['/main-window']);
  }


}
