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
  channel: Channel = new Channel({
    channelID: '',
    channelName: '',
    channelMember: [],
    createdBy: '',
    description: '',
  });
  clickedChannel: boolean = false;
  clickedThread: boolean = false;

  constructor(private channelService: ChannelService) {}

  ngOnInit() {
    this.channelService.selectedChannel$.subscribe((channel) => {
      if (channel) {
        this.channel = channel;
      }
    });
  }

  handleChannelClick(event: boolean) {
    this.clickedChannel = event;
  }

  handleThreadClick(event: boolean) {
    this.clickedThread = event;
  }
}
