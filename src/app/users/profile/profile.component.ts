import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { SharedService } from '../../services/shared.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ClickOutsideDirective } from '../../directive/click-outside.directive';
import { DirectMessageService } from '../../services/direct-message.service';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [MatIconModule, CommonModule, ClickOutsideDirective],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit, OnDestroy {
  private sharedService: SharedService = inject(SharedService);
  private directMessage: DirectMessageService = inject(DirectMessageService);
  private chatService: ChatService = inject(ChatService);
  private profileSubscription = new Subscription();

  user: any = null;


  /**
   * Subscribes to the shared profile data on initialization and sets the `user` property.
   */
  ngOnInit() {
    this.profileSubscription = this.sharedService.profile$.subscribe(
      (profile) => {
        if (profile) {
          this.user = profile;
        }
      }
    );
  }

  /**
   * Unsubscribes from the profile subscription to prevent memory leaks.
   */
  ngOnDestroy(): void {
    this.profileSubscription.unsubscribe();
  }


  /**
   * Closes the profile view by setting the `isProfile` flag to `false`.
   */
  close() {
    this.sharedService.isProfile = false;
  }


  /**
   * Opens a direct message with the current user when the event is triggered.
   * Also closes the profile view and updates various states.
   * @param event  - The event triggered when opening a direct message.
   */
  async openDM(event: Event) {
    event.preventDefault();
    this.close();
    this.sharedService.setSelectProfile(true);
    await this.directMessage.openDmFromUser(this.user);
    this.chatService.setIsChannel(false);
    this.sharedService.setIsNewMessage(false);
    this.sharedService.setClickedNewMessage(false);
    this.sharedService.setSelectedUserIndex(this.user.userId);
    this.chatService.handleWindowChangeOnMobile();
  }
}
