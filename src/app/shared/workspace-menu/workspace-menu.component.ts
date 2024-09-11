import {
  Component,
  ChangeDetectionStrategy,
  signal,
  ViewChild,
  Output,
  EventEmitter,
  Input,
  OnInit,
  ChangeDetectorRef,
  inject,
  HostListener,
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
import { Observable, Subscription } from 'rxjs';
import { Channel } from '../../../models/channel.class';
import { User } from '../../../models/user.class';
import { DirectMessageService } from '../../services/direct-message.service';
import { ChatService } from '../../services/chat.service';
import { SharedService } from '../../services/shared.service';
import { SearchComponent } from '../header/search/search.component';
import { SearchService } from '../../services/search.service';
import { ClickOutsideDirective } from '../../directive/click-outside.directive';

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
    SearchComponent,
    ClickOutsideDirective,
  ],
  templateUrl: './workspace-menu.component.html',
  styleUrl: './workspace-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspaceMenuComponent implements OnInit {
  @ViewChild('drawer') drawer!: MatDrawer;
  @Output() clickedChannelChange = new EventEmitter<boolean>();
  @Output() clickedNewMessageChange = new EventEmitter<boolean>();
  // @Output() selectProfileChange = new EventEmitter<boolean>();
  private clickedNewMessageSubscription: Subscription = new Subscription();
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

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
  openChannel: boolean = false;
  openDm: boolean = false;
  selectedUserIndex: number | null = null;
  subscription: Subscription = new Subscription();
  searchInputValue: string = '';

  clickedNewMessage: boolean = false;

  readonly panelOpenState = signal(false);

  userList$ = this.userService.userList$;

  constructor(
    private channelService: ChannelService,
    public userService: UserService,
    private directMessageService: DirectMessageService,
    public chatService: ChatService,
    public sharedService: SharedService,
    private searchService: SearchService
  ) { }


  /**
   * Initializes the component, loads the user list, and sets the first channel.
   */
  async ngOnInit() {
    this.userService.getUserList();
    setTimeout(async () => {
      await this.channelService.loadChannels();
      this.showFirstChannel();
    }, 1000);

    this.sharedService.selectedUserIndex$.subscribe((i) => {
      this.selectedUserIndex = i;
      this.cdr.detectChanges();
    });
  }

  /**
   * Listens for window resize events and triggers the checkScreenSize method.
   */
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.chatService.updateLayoutOnResize();
  }

  /**
   * Upon page load, selects the first channel from the user's channel list and sets it as the currently active channel, shown in the main-window.
   */
  showFirstChannel() {
    setTimeout(() => {
      this.subscription = this.userChannels$.subscribe((channels) => {
        if (channels.length > 0) {
          this.channel = channels[0];
          this.channelService.setSelectedChannel(this.channel);
        }
      });
      this.subscription.unsubscribe();
    }, 500);
  }

  /**
   * When a channel is clicked, it gets set as the local `channel` property.
   * The `ChannelService` is notified to set the selected channel.
   * @param channel - The Channel object
   */
  selectChannel(channel: Channel) {
    this.channel = channel;
    this.channelService.setSelectedChannel(channel);
    this.sharedService.setSelectProfile(false);
    this.chatService.setIsChannel(true);
    this.sharedService.resetSelectedUserIndex();

    this.chatService.handleWindowChangeOnMobile();
    this.sharedService.setIsNewMessage(false);
    this.sharedService.setClickedNewMessage(false);
  }


  /**
   * Toggles the drawer's open or closed state.
   */
  toggle() {
    this.drawer.toggle();
    this.open = !this.open;
    this.hover = true;
  }


  /**
   *  Handles hover state set to true.
   */
  hoverTrue() {
    this.hover = true;
  }


  /**
   * Handles hover state set to false.
   */
  hoverFalse() {
    this.hover = false;
  }


  /**
   * Toggles the new message form and updates the relevant states.
   */
  newMessage() {
    this.sharedService.toggleClickedNewMessage();
    this.sharedService.setSelectProfile(false);

    const currentIsNewMessage = this.sharedService.getIsNewMessage();
    this.sharedService.setIsNewMessage(!currentIsNewMessage);

    this.chatService.setIsChannel(false);
    this.clickedNewMessageChange.emit(
      this.sharedService.getClickedNewMessage()
    );
    this.sharedService.resetSelectedUserIndex();
    setTimeout(() => {
      this.chatService.handleWindowChangeOnMobile();
    }, 0);
    this.cdr.detectChanges();
  }


  /**
   * Toggles the state of the channel creation form.
   * @param event - The event triggered by clicking to create a channel.
   */
  createChannel(event: Event) {
    event.stopPropagation();
    this.clickedChannel = !this.clickedChannel;
    this.clickedChannelChange.emit(this.clickedChannel);
  }


  /**
   * Toggles the visibility of the channels section.
   */
  openChannelsMenu() {
    this.openChannel = !this.openChannel;
  }


  /**
   * Toggles the visibility of the direct messages section.
   */
  openDirectMessages() {
    this.openDm = !this.openDm;
  }


  /**
   * Opens the selected user's profile and initiates a direct message.
   * @param i  - The index of the selected user.
   * @param profile - The profile object of the selected user.
   */
  async clickedProfile(i: number, profile: User) {
    this.sharedService.setSelectedUserIndex(profile.userId);
    this.sharedService.setSelectProfile(true);
    await this.directMessageService.openDmFromUser(profile);
    this.chatService.setIsChannel(false);
    this.sharedService.setIsNewMessage(false);
    this.sharedService.setClickedNewMessage(false);
    this.chatService.handleWindowChangeOnMobile();
  }

  /**
   * 
   * @param channel 
   */
  editChannel(channel: string) { }


  /**
   * Opens search results by subscribing to the necessary services and fetching search data.
   */
  async openResults() {
    try {
      this.searchService.startSubscription();
      this.sharedService.isResults = this.searchInputValue.trim().length > 0;

      await Promise.all([
        this.searchService.getAllDM(),
        this.searchService.getAllChannel(),
        this.searchService.getAllThreads(),
      ]);

      await this.searchService.search(this.searchInputValue);

      this.searchService.setTimerToTrue();
    } catch (error) {
      console.error('Fehler beim Aufrufen von Openresults', error);
    }
  }


  /**
   * Closes the search results and resets the input field.
   */
  closeResults() {
    this.searchService.stopSubscription();
    this.sharedService.isResults = false;
    this.searchInputValue = '';
  }
}
