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
import { user } from '@angular/fire/auth';
import { SharedService } from '../../../services/shared.service';
import { ChannelService } from '../../../services/channel.service';
import { Channel } from '../../../../models/channel.class';
import { ChannelMessageService } from '../../../services/channel-message.service';
import { ThreadService } from '../../../services/thread.service';
import { MainWindowComponent } from '../../../main-window/main-window.component';
import { User } from '../../../../models/user.class';
import {
  DirectMessage,
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
  currentUser: any = '';

  @Output() searchInputValueAction: EventEmitter<void> =
    new EventEmitter<void>();

  constructor() { }

  async ngOnInit() {
    this.currentUserSubscription = this.userService.currentUser$.subscribe(
      (user) => {
        this.currentUser = user;
      }
    );
  }

  ngOnDestroy(): void {
    this.currentUserSubscription.unsubscribe();
  }

  openChannel(event: Event, channel: Channel) {
    event?.stopPropagation();
    this.sharedService.isResults = false;
    console.log(channel)
    this.channelService.setSelectedChannel(channel);
    this.sharedService.setSelectProfile(false);
    this.chatService.setIsChannel(true);
    this.resetSearchInputValue();
    this.sharedService.resetSelectedUserIndex();
    this.sharedService.setIsNewMessage(false);
    this.sharedService.setClickedNewMessage(false);
    this.chatService.handleWindowChangeOnMobile();
  }

  openThread(thread: any) {
    let channelMsg = thread['replyToMessage'];
    this.mainWindow.selectProfile = false;
    this.mainWindow.clickedThread = true;
    // this.channelService.setSelectedChannel(channelMsg);
    this.channelMessageService.setSelectedMessage(channelMsg);
    this.threadService.handleThread();
    this.resetSearchInputValue();
    this.sharedService.resetSelectedUserIndex();
  }

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
    this.chatService.showWorkspaceMenu();
    this.sharedService.setIsNewMessage(false);
  }

  resetSearchInputValue() {
    this.searchInputValueAction.emit();
  }

  async setProfilestate(dm: DmMessage) {
    let state = '';
    this.searchService.userList.forEach((user) => {
      if (user.userId == dm.profileId) {
        state = user.state;
      }
    });
    return state;
  }

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

  openProfile(event: Event, userID: string) {
    event?.stopPropagation();
    this.sharedService.isResults = false;
    this.sharedService.openProfile(userID);
    this.resetSearchInputValue();
  }
}
