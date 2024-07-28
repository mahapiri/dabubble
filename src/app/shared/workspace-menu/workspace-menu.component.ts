import {
  Component,
  ChangeDetectionStrategy,
  signal,
  ViewChild,
  Output,
  EventEmitter,
  Input,
  inject,
} from '@angular/core';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { User } from '../../models/user.interface';
import { CommonModule } from '@angular/common';
import { CreateChannelComponent } from '../../channel/create-channel/create-channel.component';
import { ChannelService } from '../../services/channel.service';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-workspace-menu',
  standalone: true,
  imports: [
    MatSidenavModule,
    MatExpansionModule,
    MatButtonModule,
    MatIconModule,
    CommonModule,
    CreateChannelComponent,
    FormsModule,
  ],
  templateUrl: './workspace-menu.component.html',
  styleUrl: './workspace-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspaceMenuComponent {
  hover: boolean = false;
  open: boolean = false;
  clickedMessage: boolean = false;
  clickedUser: boolean = false;
  openChannel: boolean = false;
  openDm: boolean = false;
  @Input() clickedChannel: boolean = false;
  channelService: ChannelService = inject(ChannelService);
  userService: UserService = inject(UserService);

  user: User[] = [
    {
      name: 'Federik Beck (Du)',
      img: '../../../assets/img/character1.png',
      status: 'online',
    },
    {
      name: 'Sofia Müller',
      img: '../../../assets/img/character2.png',
      status: 'online',
    },
    {
      name: 'Noah Braun',
      img: '../../../assets/img/character3.png',
      status: 'offline',
    },
    {
      name: 'Elise Roth',
      img: '../../../assets/img/character4.png',
      status: 'offline',
    },
    {
      name: 'Elias Neumann',
      img: '../../../assets/img/character5.png',
      status: 'online',
    },
    {
      name: 'Steffen Hoffmann',
      img: '../../../assets/img/character6.png',
      status: 'online',
    },
  ];

  readonly panelOpenState = signal(false);
  @ViewChild('drawer') drawer!: MatDrawer;
  @Output() clickedChannelChange = new EventEmitter<boolean>();
  userChannels$ = this.userService.userChannels$;

  constructor() {}

  toggle() {
    this.drawer.toggle();
    this.open = !this.open;
    this.hover = true;
  }

  hoverTrue() {
    this.hover = true;
  }

  hoverFalse() {
    this.hover = false;
  }

  newMessage() {
    this.clickedMessage = !this.clickedMessage;
  }

  createChannel() {
    this.clickedChannel = !this.clickedChannel;
    this.clickedChannelChange.emit(this.clickedChannel);
    this.channelService.createChannel();
  }

  openChannels() {
    this.openChannel = !this.openChannel;
  }

  openDirectMessages() {
    this.openDm = !this.openDm;
  }

  clickedProfile(i: number) {
    this.clickedUser = !this.clickedUser;
    let id = i;
    document.getElementById(`profile-${id}`)?.classList.toggle('bold-user');
  }

  editChannel(channel: string) {}
}
