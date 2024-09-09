import { Component, HostListener, inject, OnInit } from '@angular/core';
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
import { SharedService } from '../../services/shared.service';
import { Subscription } from 'rxjs';
import { ChannelService } from '../../services/channel.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatIconModule,
    ClickOutsideDirective,
    CommonModule,
    MyProfileComponent,
    FormsModule,
    ClickOutsideDirective,
    MatDividerModule,
    SearchComponent,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  clickedUser: boolean = false;
  clickedProfile: boolean = false;
  authService: AuthService = inject(AuthService);
  userService: UserService = inject(UserService);
  chatService: ChatService = inject(ChatService);
  sharedService: SharedService = inject(SharedService);
  channelService: ChannelService = inject(ChannelService);
  directMessageService: DirectMessageService = inject(DirectMessageService);
  searchService: SearchService = inject(SearchService);
  currentUser: any = '';
  searchInputValue: string = '';
  isSmallScreen!: boolean;

  headerLogo: string = 'daBubble';
  private subscription: Subscription = new Subscription();

  constructor(private router: Router) {}

  async ngOnInit() {
    this.userService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });

    this.subscription.add(
      this.chatService.headerLogo$.subscribe((isChanged) => {
        this.headerLogo = isChanged;
      })
    );

    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isSmallScreen = window.innerWidth <= 1190;
  }

  async openResults() {
    try {
      this.searchService.startSubscription();
      this.sharedService.isResults = this.searchInputValue.trim().length > 0;

      await Promise.all([
        this.searchService.getAllDM(),
        this.searchService.getAllChannel(),
        this.searchService.getAllThreads(),
      ]);

      await this.searchService.search(this.searchInputValue);

      this.searchService.setTimerToTrue();
    } catch (error) {
      console.error('Fehler beim Aufrufen von Openresults', error);
    }
  }

  closeResults() {
    this.searchService.stopSubscription();
    this.sharedService.isResults = false;
    this.searchInputValue = '';
  }

  /*   @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.chatService.updateHeaderOnMobile();
    this.isChannelSelectedOnMobile =
      this.chatService.setIsChannelSelectedOnMobile();
  } */

  backToWorkspacemenu() {
    this.chatService.setIsChannel(false);
    this.sharedService.setSelectProfile(false);
    this.chatService.setClickedBack(true);
    this.chatService.handleWindowChangeOnMobile();
  }

  openPopup(event: Event) {
    event.stopPropagation();
    if (!this.clickedUser) {
      this.clickedUser = true;
      this.channelService.closePopup();
      this.channelService.animationState = 'opening';
    } else {
      this.channelService.animationState = 'closing';
      setTimeout(() => {
        this.clickedUser = false;
        this.channelService.animationState = 'none';
      }, 150); // Time of the slide-in Animation
    }
  }

  closePopup() {
    if (this.clickedUser) {
      this.channelService.animationState = 'closing';

      setTimeout(() => {
        this.clickedUser = false;
        this.channelService.animationState = 'none';
      }, 150); // Time of the slide-out Animation
    }
  }

  openProfile(event: Event) {
    event.stopPropagation();
    this.clickedProfile = true;
    this.clickedUser = false;
  }

  profileClosed() {
    this.clickedProfile = false;
  }

  async logOut(event: Event) {
    event.preventDefault();
    await this.authService.logOut();
    this.router.navigate(['/']);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
