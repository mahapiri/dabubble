import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { SearchService } from '../../../services/search.service';
import { UserService } from '../../../services/user.service';
import { ChatService } from '../../../services/chat.service';
import { DirectMessageService } from '../../../services/direct-message.service';
import { Subscription } from 'rxjs';
import { SharedService } from '../../../services/shared.service';
import { ChannelService } from '../../../services/channel.service';
import { Channel } from '../../../../models/channel.class';
import { ChannelMessageService } from '../../../services/channel-message.service';
import { ThreadService } from '../../../services/thread.service';
import { MainWindowComponent } from '../../../main-window/main-window.component';
import {
  DmMessage,
} from '../../../../models/direct-message.class';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [MatIconModule, CommonModule, FormsModule, MatDividerModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
})
export class SearchComponent implements OnInit, OnDestroy {
  searchService: SearchService = inject(SearchService);
  userService: UserService = inject(UserService);
  chatService: ChatService = inject(ChatService);
  mainWindow: MainWindowComponent = inject(MainWindowComponent);
  channelService: ChannelService = inject(ChannelService);
  channelMessageService: ChannelMessageService = inject(ChannelMessageService);
  threadService: ThreadService = inject(ThreadService);
  directMessageService: DirectMessageService = inject(DirectMessageService);
  sharedService: SharedService = inject(SharedService);
  currentUserSubscription: Subscription = new Subscription();
  clickedThreadSubscription: Subscription = new Subscription();
  currentUser: any = '';

  @Output() searchInputValueAction: EventEmitter<void> =
    new EventEmitter<void>();

  isThread: boolean = false;

  constructor() { }


  /**
   * Initializes the component by subscribing to the current user and thread status.
   * Fetches the current user data and listens for thread click events.
   */
  async ngOnInit() {
    this.currentUserSubscription = this.userService.currentUser$.subscribe(
      (user) => {
        this.currentUser = user;
      }
    );

    this.clickedThreadSubscription = this.sharedService.clickedThread$.subscribe((status) => {
      this.isThread = status;
    })
  }


  /**
   * Unsubscribes from the currentUser and clickedThread subscriptions when the component is destroyed.
   */
  ngOnDestroy(): void {
    this.currentUserSubscription.unsubscribe();
    this.clickedThreadSubscription.unsubscribe();
  }


  /**
   * Opens the selected channel and resets relevant states.
   * Handles the layout for mobile screens.
   * @param event - The event triggered by clicking on a channel.
   * @param channel - The channel to open.
   */
  openChannel(event: Event, channel: Channel) {
    event?.stopPropagation();
    this.sharedService.isResults = false;
    this.channelService.setSelectedChannel(channel);
    this.sharedService.setSelectProfile(false);
    this.chatService.setIsChannel(true);
    this.resetSearchInputValue();
    this.sharedService.resetSelectedUserIndex();
    this.sharedService.setIsNewMessage(false);
    this.sharedService.setClickedNewMessage(false);
    this.chatService.handleWindowChangeOnMobile();
  }


  /**
   * Opens the selected thread and adjusts the UI accordingly.
   * Handles mobile window layout adjustments.
   * @param thread - The thread to be opened.
   */
  async openThread(thread: any) {
    let channelMsg = thread['replyToMessage'];
    await this.sharedService.setClickedThread(true);
    this.mainWindow.selectProfile = false;
    let channel = await this.searchService.getChannel(channelMsg.id);
    this.channelService.setSelectedChannel(channel);
    this.channelMessageService.setSelectedMessage(channelMsg);
    await this.threadService.handleThread();
    this.resetSearchInputValue();
    this.sharedService.resetSelectedUserIndex();
    setTimeout(() => {
      this.chatService.handleWindowChangeOnMobile();
    }, 100);
  }


  /**
   * Opens a direct message (DM) with the selected profile and resets relevant states.
   * Adjusts the layout for mobile screens.
   * @param event - The event triggered by clicking on a DM.
   * @param dm - The direct message object to be opened.
   */
  async openDM(event: Event, dm: any) {
    event?.stopPropagation();
    this.sharedService.isResults = false;
    let profile = await this.setProfile(dm);
    this.setProfilestate(dm);
    this.sharedService.setSelectProfile(true);
    await this.directMessageService.openDmFromUser(profile);
    this.chatService.setIsChannel(false);
    this.sharedService.setSelectedUserIndex(profile.userId);
    this.resetSearchInputValue();
    this.sharedService.setClickedNewMessage(false);
    this.chatService.handleWindowChangeOnMobile();
    this.sharedService.setIsNewMessage(false);
  }


  /**
   * Emits an event to reset the search input value to its initial state.
   */
  resetSearchInputValue() {
    this.searchInputValueAction.emit();
  }


  /**
   * Sets the online/offline state of the profile associated with the DM.
   * @param dm - The direct message object containing profile information.
   * @returns 
   */
  async setProfilestate(dm: DmMessage) {
    let state = '';
    this.searchService.userList.forEach((user) => {
      if (user.userId == dm.profileId) {
        state = user.state;
      }
    });
    return state;
  }


  /**
   * Sets the profile for the selected direct message by determining whether the current user is the author or the recipient.
   * @param dm - The direct message object containing profile information.
   * @returns 
   */
  async setProfile(dm: any) {
    const isCurrentUser = this.currentUser?.userId === dm['profileId'];

    return {
      username: isCurrentUser ? dm['authorName'] : dm['profileName'],
      userId: isCurrentUser ? dm['authorId'] : dm['profileId'],
      email: '',
      state: await this.setProfilestate(dm),
      userChannels: [],
      profileImage: isCurrentUser ? dm['authorImg'] : dm['profileImg'],
    };
  }


  /**
   * Opens the profile of the selected user based on their user ID.
   * Resets the search input and displays the selected profile.
   * @param event - The event triggered by clicking on a user profile.
   * @param userID - The ID of the user whose profile is being opened.
   */
  openProfile(event: Event, userID: string) {
    event?.stopPropagation();
    this.sharedService.isResults = false;
    this.sharedService.openProfile(userID);
    this.resetSearchInputValue();
  }
}
