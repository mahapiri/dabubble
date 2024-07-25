import { Component, EventEmitter, Output } from '@angular/core';
import { HeaderComponent } from '../shared/header/header.component';
import { WorkspaceMenuComponent } from '../shared/workspace-menu/workspace-menu.component';
import { ChannelComponent } from '../main-board/channel/channel.component';
import { CreateChannelComponent } from '../main-board/create-channel/create-channel.component';
import { CommonModule } from '@angular/common';
import { ThreadComponent } from '../main-board/thread/thread.component';
import { ProfileComponent } from '../users/profile/profile.component';
import { PrivacyPolicyComponent } from '../privacy-policy/privacy-policy.component';
import { DirectMessagesComponent } from '../direct-messages/direct-messages.component';

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
    DirectMessagesComponent,
  ],
  templateUrl: './main-window.component.html',
  styleUrl: './main-window.component.scss',
})
export class MainWindowComponent {
  clickedChannel: boolean = false;
  clickedAnswer: boolean = false;

  handleChannelClick(event: boolean) {
    this.clickedChannel = event;
  }
}
