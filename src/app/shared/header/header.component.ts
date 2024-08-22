import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { ClickOutsideDirective } from '../../directive/click-outside.directive';
import { CommonModule } from '@angular/common';
import { MyProfileComponent } from '../../users/my-profile/my-profile.component';
import { SearchService } from '../../services/search.service';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { MatDividerModule } from '@angular/material/divider';
import { DirectMessageService } from '../../services/direct-message.service';
import { SearchComponent } from '../header/search/search.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatIconModule, ClickOutsideDirective, CommonModule, MyProfileComponent, FormsModule, ClickOutsideDirective, MatDividerModule, SearchComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  clickedUser: boolean = false; 
  clickedProfile: boolean = false;
  authService: AuthService = inject(AuthService);
  userService: UserService = inject(UserService);
  chatService: ChatService = inject(ChatService);
  directMessageService: DirectMessageService = inject(DirectMessageService);
  searchService: SearchService = inject(SearchService);
  currentUser: any = '';
  isResults: boolean = false;

  constructor(private router: Router) {}

  async ngOnInit() {
    await this.userService.getUserID();
    this.userService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  async openResults() {
    this.isResults = true;
    await this.searchService.getAllDM();
    await this.searchService.getAllChannel();
  }

  closeResults() {
    this.isResults = false;
  }
  
  openPopup(event: Event) {
    event.stopPropagation();
    this.clickedUser = !this.clickedUser;
  }

  closePopup() {
    if (this.clickedUser) {
      this.clickedUser = false;
    }
  }

  openProfile() {
    this.clickedProfile = true;
    this.clickedUser = false;
  }

  profileClosed() {
    this.clickedProfile = false;
  }

  async logOut(event: Event){
    event.preventDefault();
    await this.authService.logOut();
    this.router.navigate(['/']);
  }



}
