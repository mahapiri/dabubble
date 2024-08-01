import {
  Component,
  ChangeDetectionStrategy,
  signal,
  ViewChild,
  Output,
  EventEmitter,
  Input,
  inject,
  OnInit,
} from '@angular/core';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { CreateChannelComponent } from '../../channel/create-channel/create-channel.component';
import { ChannelService } from '../../services/channel.service';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { Observable } from 'rxjs';
import { Channel } from '../../../models/channel.class';
import { onSnapshot } from '@angular/fire/firestore';
import { User } from '../../../models/user.class';

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
export class WorkspaceMenuComponent implements OnInit {
  @ViewChild('drawer') drawer!: MatDrawer;
  @Output() clickedChannelChange = new EventEmitter<boolean>();
  @Output() selectProfile = new EventEmitter<boolean>();
  @Input() clickedChannel: boolean = false;

  userChannels$: Observable<Channel[]> = this.userService.userChannels$;
  channel: Channel = new Channel({
    channelID: '',
    channelName: '',
    channelMember: [],
    createdBy: '',
    description: '',
  });

  [x: string]: any;
  hover: boolean = false;
  open: boolean = false;
  clickedMessage: boolean = false;
  clickedUser: boolean = false;
  openChannel: boolean = false;
  openDm: boolean = false;

  readonly panelOpenState = signal(false);

  userList$ = this.userService.userList$;

  constructor(
    private channelService: ChannelService,
    private userService: UserService
  ) {}

  async ngOnInit() {
    await this.userService.getUserID();
    this.userService.getUserList();
    setTimeout(() => {
      this.loadChannels();
    }, 500);
    this.showFirstChannel();
  }

  showFirstChannel() {
    this.userChannels$.subscribe((channels) => {
      if (channels.length > 0) {
        this.channel = channels[0];
        this.channelService.setSelectedChannel(this.channel);
      }
    });
  }

  selectChannel(channel: Channel) {
    this.channel = channel;
    this.channelService.setSelectedChannel(channel);
  }

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
  }

  /**
   * Loads the channels of the current user. Retrieves the channelIDs saved in the user via the user ref from the data base.
   * Gets the Channel Data from the channel collection with the ChannelIds.
   * Awaits all Promises, filters the channels for undefined channels and updates the Behavior Subject _userChannels.
   */
  async loadChannels() {
    onSnapshot(this.userService.getUserRef(), async (doc) => {
      const data = doc.data();
      if (data) {
        const channelIds = data['userChannels'] || [];
        const channelPromises = channelIds.map((channelId: string) =>
          this.channelService.getChannelById(channelId)
        );
        const channels = await Promise.all(channelPromises);
        this.userService._userChannels.next(
          channels.filter((channel) => channel !== undefined) as Channel[]
        );
      }
    });
  }

  openChannelsMenu() {
    this.openChannel = !this.openChannel;
  }

  openDirectMessages() {
    this.openDm = !this.openDm;
  }

  clickedProfile(i: number, profile: User) {
    this.clickedUser = !this.clickedUser;
    let id = i;
    document.getElementById(`profile-${id}`)?.classList.toggle('bold-user');
    this.selectProfile.emit();
  }

  editChannel(channel: string) {}
}
