import { Component } from '@angular/core';
import { HeaderComponent } from '../shared/header/header.component';
import { WorkspaceMenuComponent } from '../shared/workspace-menu/workspace-menu.component';
import { ChannelComponent } from '../main-board/channel/channel.component';

@Component({
  selector: 'app-main-window',
  standalone: true,
  imports: [HeaderComponent, WorkspaceMenuComponent, ChannelComponent],
  templateUrl: './main-window.component.html',
  styleUrl: './main-window.component.scss'
})
export class MainWindowComponent {

}
