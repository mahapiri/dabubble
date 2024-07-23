import { Component, EventEmitter, Output } from '@angular/core';
import { HeaderComponent } from '../shared/header/header.component';
import { WorkspaceMenuComponent } from '../shared/workspace-menu/workspace-menu.component';
import { ChannelComponent } from '../main-board/channel/channel.component';
import { CreateChannelComponent } from '../main-board/create-channel/create-channel.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-window',
  standalone: true,
  imports: [HeaderComponent, WorkspaceMenuComponent, ChannelComponent, CreateChannelComponent, CommonModule],
  templateUrl: './main-window.component.html',
  styleUrl: './main-window.component.scss'
})
export class MainWindowComponent {
  clickedChannel: boolean = false;

  handleChannelClick(event: boolean) {
    this.clickedChannel = event;
  }
}
