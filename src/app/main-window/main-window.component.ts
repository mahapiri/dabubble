import { Component } from '@angular/core';
import { HeaderComponent } from '../shared/header/header.component';
import { WorkspaceMenuComponent } from '../shared/workspace-menu/workspace-menu.component';
import { ChannelComponent } from '../channel/channel/channel.component';
import { CreateChannelComponent } from '../channel/create-channel/create-channel.component';
import { CommonModule } from '@angular/common';
import { ThreadComponent } from '../thread/thread.component';
import { ProfileComponent } from '../users/profile/profile.component';
import { PrivacyPolicyComponent } from '../privacy-policy/privacy-policy.component';
import { DirectMessageComponent } from '../direct-message/direct-message.component';

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
export class MainWindowComponent {
  clickedChannel: boolean = false;
  clickedOpenThread: boolean = false;

  handleChannelClick(event: boolean) {
    this.clickedChannel = event;
  }

  handleThreadClick(event: boolean) {
    this.clickedOpenThread = event;
  }
}
