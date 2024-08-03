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
import { DirectMessageService } from '../../services/direct-message.service';

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
  @Output() selectProfileChange = new EventEmitter<boolean>();
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
  openChannel: boolean = false;
  openDm: boolean = false;
  selectedUserIndex: number | null = null; 

  readonly panelOpenState = signal(false);

  userList$ = this.userService.userList$;

  constructor(
    private channelService: ChannelService,
    public userService: UserService,
    private directMessage: DirectMessageService
  ) {}

  async ngOnInit() {
    await this.userService.getUserID();
    this.userService.getUserList();
    setTimeout(() => {
      this.loadChannels();
    }, 500);
    this.showFirstChannel();
  }

  /**
   * Upon page load, selects the first channel from the user's channel list and sets it as the currently active channel, shown in the main-window.
   */
  showFirstChannel() {
    this.userChannels$.subscribe((channels) => {
      if (channels.length > 0) {
        this.channel = channels[0];
        this.channelService.setSelectedChannel(this.channel);
      }
    });
  }

  /**
   * When a channel is clicked, it gets set as the local `channel` property.
   * The `ChannelService` is notified to set the selected channel.
   * @param channel - The Channel object
   */
  selectChannel(channel: Channel) {
    this.channel = channel;
    this.channelService.setSelectedChannel(channel);
    this.selectProfileChange.emit(false);
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
    this.selectedUserIndex = i;
    this.selectProfileChange.emit(true);
    this.directMessage.getActualProfile(profile);
    this.directMessage.addDirectMessage(profile);
  }

  editChannel(channel: string) {}
}
