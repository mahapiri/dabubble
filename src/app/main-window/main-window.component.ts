import { Component, HostListener, OnInit, inject } from '@angular/core';
import { HeaderComponent } from '../shared/header/header.component';
import { WorkspaceMenuComponent } from '../shared/workspace-menu/workspace-menu.component';
import { ChannelComponent } from '../channel/channel/channel.component';
import { CreateChannelComponent } from '../channel/create-channel/create-channel.component';
import { CommonModule } from '@angular/common';
import { ThreadComponent } from '../thread/thread.component';
import { ProfileComponent } from '../users/profile/profile.component';
import { PrivacyPolicyComponent } from '../privacy-policy/privacy-policy.component';
import { DirectMessageComponent } from '../direct-message/direct-message.component';
import { Channel } from '../../models/channel.class';
import { ChannelService } from '../services/channel.service';
import { UserService } from '../services/user.service';
import { ChannelMessageService } from '../services/channel-message.service';
import { Subscription } from 'rxjs';
import { SharedService } from '../services/shared.service';
import { ClickOutsideDirective } from '../directive/click-outside.directive';
import { NewMessageComponent } from '../new-message/new-message.component';
import { MyProfileComponent } from '../users/my-profile/my-profile.component';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-main-window',
  standalone: true,
  imports: [
    HeaderComponent,
    WorkspaceMenuComponent,
    ChannelComponent,
    CreateChannelComponent,
    CommonModule,
    ThreadComponent,
    ProfileComponent,
    PrivacyPolicyComponent,
    DirectMessageComponent,
    ClickOutsideDirective,
    NewMessageComponent,
    MyProfileComponent
  ],
  templateUrl: './main-window.component.html',
  styleUrl: './main-window.component.scss',
})
export class MainWindowComponent implements OnInit {
  userService: UserService = inject(UserService);
  authService: AuthService = inject(AuthService);
  channelMessagesService: ChannelMessageService = inject(ChannelMessageService);
  sharedService: SharedService = inject(SharedService);
  selectProfileSubscription: Subscription = new Subscription();
  isNewMessageSubscription: Subscription = new Subscription();
  clickedThreadSubscription: Subscription = new Subscription();

  channel: Channel = new Channel({
    channelID: '',
    channelName: '',
    channelMember: [],
    createdBy: '',
    description: '',
  });
  clickedChannel: boolean = false;
  clickedThread: boolean = false;
  selectProfile: boolean = false;
  isNewMessage: boolean = false;
  selectedChannel: Subscription | undefined;

  constructor(private channelService: ChannelService) {}

  ngOnInit() {
    this.userService.getUserID();
    this.selectedChannel = this.channelService.selectedChannel$.subscribe(
      (channel) => {
        if (channel) {
          this.channel = channel;
          this.channelService.setChannelId(channel);
          this.channelMessagesService.subMessageList();
        }
      }
    );

    this.selectProfileSubscription =
      this.sharedService.selectProfileChange$.subscribe((selectProfile) => {
        this.selectProfile = selectProfile;
      });

    this.isNewMessageSubscription = this.sharedService.isNewMessage$.subscribe(
      (isNewMessage) => {
        this.isNewMessage = isNewMessage;
      }
    );

    this.clickedThreadSubscription = 
      this.sharedService.clickedThread$.subscribe((selectThread) => {
        this.clickedThread = selectThread;
      })
  }

  /**
   * Handles the channel click event. Updates the `clickedChannel` state based on the provided event value.
   * @param {boolean} event - The value indicating if the channel was clicked or not.
   */
  handleChannelClick(event: boolean) {
    this.clickedChannel = event;
  }

  /**
   * Handles the thread click event. Updates the `clickedThread` state based on the provided event value.
   * @param {boolean} event - The value indicating if the thread was clicked or not.
   */
  handleThreadClick(event: boolean) {
    this.sharedService.setClickedThread(event);
  }

  /**
   * Handles the profile click event by resetting the state of other elements `clickedChannel` and `clickedThread`to false.
   */
  handleProfileClick() {
    this.clickedChannel = false;
    this.sharedService.setClickedThread(false);
  }

  /**
   * Clean up subscriptions and resources when the component is destroyed.
   */
  ngOnDestroy() {
    this.userService.authStateSubscription?.unsubscribe();
    this.selectedChannel?.unsubscribe();
    if (this.channelMessagesService.messageListUnsubscribe) {
      this.channelMessagesService.messageListUnsubscribe();
    }
    this.selectProfileSubscription?.unsubscribe();
    this.isNewMessageSubscription?.unsubscribe();
    this.clickedThreadSubscription.unsubscribe();
  }

  @HostListener('window:beforeunload', ['$event'])
  async handleBeforeUnload(event: Event) {
    await this.userService.setUserState('offline');
  }
}
