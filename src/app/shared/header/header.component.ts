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
import { MainWindowComponent } from '../../main-window/main-window.component';

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
  authService: AuthService = inject(AuthService);
  userService: UserService = inject(UserService);
  chatService: ChatService = inject(ChatService);
  mainWindow: MainWindowComponent = inject(MainWindowComponent);
  sharedService: SharedService = inject(SharedService);
  channelService: ChannelService = inject(ChannelService);
  directMessageService: DirectMessageService = inject(DirectMessageService);
  searchService: SearchService = inject(SearchService);

  private subscription: Subscription = new Subscription();

  clickedUser: boolean = false;
  clickedProfile: boolean = false;
  currentUser: any = '';
  searchInputValue: string = '';
  isSmallScreen!: boolean;

  headerLogo: string = 'daBubble';

  constructor(private router: Router) {}

  /**
   * Subscribes to `currentUser$` from the `UserService` to get the current user information.
   * Subscribes to `headerLogo$` from the `ChatService` to dynamically update the header logo.
   * Calls `checkScreenSize()` to determine if the screen size is below the 1190px threshold.
   *
   */
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

  /**
   * Listens for window resize events and triggers the checkScreenSize method.
   */
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  /**
   * Checks the current screen size and sets the `isSmallScreen` flag if the width is less than or equal to 1190px.
   */
  private checkScreenSize() {
    this.isSmallScreen = window.innerWidth <= 1190;
  }

  /**
   * Initiates a search based on the user input in the search bar.
   * Starts search subscriptions and retrieves data for direct messages, channels, and threads.
   * If the search input is not empty, it runs the search and updates the result state.
   *
   * @returns {Promise<void>} A promise that resolves when the search is complete.
   */
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
      console.error('Error to open the results', error);
    }
  }

  /**
   * Closes the search results and clears the search input field.
   */
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

  /**
   * Handles navigation back to the workspace menu, resetting the profile and channel states.
   */
  backToWorkspacemenu() {
    this.chatService.setIsChannel(false);
    this.sharedService.setSelectProfile(false);
    this.mainWindow.clickedThread = false;
    this.chatService.setClickedBack(true);
    this.chatService.handleWindowChangeOnMobile();
    this.chatService.showWorkspaceMenu();
    this.chatService.setClickedBack(false);
    this.sharedService.resetSelectedUserIndex();
  }

  /**
   *  Toggles the popup for user interactions.
   * Opens the popup if it is currently closed.
   * Closes the popup if it is currently open with a small delay for animation.
   *
   * @param {Event} event - The DOM event triggering the popup.
   */
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
      }, 150);
    }
  }

  /**
   * Closes the popup for user interactions with a small delay for animation.
   */
  closePopup() {
    if (this.clickedUser) {
      this.channelService.animationState = 'closing';

      setTimeout(() => {
        this.clickedUser = false;
        this.channelService.animationState = 'none';
      }, 150); // Time of the slide-out Animation
    }
  }

  /**
   * Opens the user's profile popup.
   *
   * @param {Event} event - The DOM event triggering the profile opening.
   */
  openProfile(event: Event) {
    event.stopPropagation();
    this.clickedProfile = true;
    this.clickedUser = false;
  }

  /**
   * Closes the user's profile popup.
   */
  profileClosed() {
    this.clickedProfile = false;
  }

  /**
   * Logs the user out of the application and navigates back to the home page.
   *
   * @param {Event} event - The logout event.
   * @returns {Promise<void>} A promise that resolves when the logout is complete.
   */
  async logOut(event: Event) {
    event.preventDefault();
    await this.authService.logOut();
    this.router.navigate(['/']);
  }

  /**
   * Unsubscribes from all active subscriptions to prevent memory leaks.
   */
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  /**
   * Navigates to the main window of the application and resets the necessary states.
   */
  navigateToMainWindow() {
    this.router.navigate(['/main-window']);
    this.mainWindow.clickedThread = false;
    this.chatService.setIsChannel(true);
    this.sharedService.setSelectProfile(false);
    this.sharedService.resetSelectedUserIndex();
  }
}
