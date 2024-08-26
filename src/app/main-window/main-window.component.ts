import { Component, OnInit, inject } from '@angular/core';
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
  ],
  templateUrl: './main-window.component.html',
  styleUrl: './main-window.component.scss',
})
export class MainWindowComponent implements OnInit {
  userService: UserService = inject(UserService)
  channelMessagesService: ChannelMessageService = inject(ChannelMessageService)
  sharedService: SharedService = inject(SharedService)
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
  selectedChannel: Subscription | undefined;


  constructor(private channelService: ChannelService) {}

  ngOnInit() {
    this.userService.getUserID();
    this.selectedChannel = this.channelService.selectedChannel$.subscribe((channel) => {
      if (channel) {
        this.channel = channel;
        this.channelService.setChannelId(channel);
        this.channelMessagesService.subMessageList();
      }
    });
  }

  handleChannelClick(event: boolean) {
    this.clickedChannel = event;
  }

  handleThreadClick(event: boolean) {
    this.clickedThread = event;
  }

  handleProfileClick(event: boolean) {
    this.selectProfile = event;
    this.clickedChannel = false;
    this.clickedThread = false;
  }

  ngOnDestroy(){
    this.userService.authStateSubscription?.unsubscribe()
    this.selectedChannel?.unsubscribe()
    if (this.channelMessagesService.messageListUnsubscribe) {
          this.channelMessagesService.messageListUnsubscribe()
    }
  }
}
