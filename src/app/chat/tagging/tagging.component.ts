import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { User } from '../../../models/user.class';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClickOutsideDirective } from '../../directive/click-outside.directive';
import { TaggingService } from '../../services/tagging.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { UserService } from '../../services/user.service';
import { Channel, ChannelMember } from '../../../models/channel.class';

@Component({
  selector: 'app-tagging',
  standalone: true,
  imports: [MatIconModule, CommonModule, FormsModule, ClickOutsideDirective],
  templateUrl: './tagging.component.html',
  styleUrl: './tagging.component.scss',
})
export class TaggingComponent implements OnInit, OnDestroy {
  @Input() showUser: User[] = [];
  @Output() closePopup: EventEmitter<void> = new EventEmitter<void>();
  public taggingService: TaggingService = inject(TaggingService);
  private userService: UserService = inject(UserService);
  private userSubscription: Subscription = new Subscription();

  searchText: string = '';
  filteredMembers: ChannelMember[] = [];
  userlist: User[] = [];
  channellist: Channel[] = [];
  currentUser: any;
  @Input() isFromThread: boolean = false;
  @Input() isFromChannel: boolean = false;
  @Input() isNewMessage: boolean = false;
  @Input() dmTag: boolean = false;
  @Input() isAt: boolean = false;
  @Input() isHash: boolean = false;

  
  /**
   * subscribes the current user
   */
  constructor() {
    this.userService.currentUser$.subscribe((user) => {
      this.currentUser = user?.username;
    });
  }


  /**
   * get all user from current channel
   */
  ngOnInit() {
    this.filteredMembers = this.taggingService.currentChannelMember;
    this.userlist = this.taggingService.currentUserlist;
    this.channellist = this.taggingService.currentChannellist;
  }


  /**
   * unsubscribes the current user
   */
  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }


  /**
  * search channel to tag
  */
  searchChannel() {
    if (this.searchText.trim() === '') {
      this.channellist = this.taggingService.currentChannellist;
    } else {
      const lowerSearchText = this.searchText.toLowerCase();
      this.channellist = this.taggingService.currentChannellist.filter(
        (channel: Channel) =>
          channel.channelName.toLowerCase().includes(lowerSearchText)
      );
    }
  }

  /**
   * search member to tag
   */
  searchMember() {
    if (this.searchText.trim() === '') {
      this.filteredMembers = this.taggingService.currentChannelMember;
    } else {
      const lowerSearchText = this.searchText.toLowerCase();
      this.filteredMembers = this.taggingService.currentChannelMember.filter(
        (member: ChannelMember) =>
          member.username.toLowerCase().includes(lowerSearchText)
      );
    }
  }


  /**
   * search user to tag
   */
  searchUser() {
    if (this.searchText.trim() === '') {
      this.userlist = this.taggingService.currentUserlist;
    } else {
      const lowerSearchText = this.searchText.toLowerCase();
      this.userlist = this.taggingService.currentUserlist.filter(
        (user: User) =>
          user.username.toLowerCase().includes(lowerSearchText)
      );
    }
  }


  /**
   * select a member and then close the popup window
   */
  selectMemberToChannel(member: ChannelMember) {
    if (this.dmTag) {
      this.taggingService.selectMemberDirectMessage(member);
    } else if (this.isFromThread) {
      this.taggingService.selectMemberThread(member);
    } else if (this.isNewMessage) {
      this.taggingService.selectMemberNewMessage(member);
    } else if(this.isFromChannel) {
      this.taggingService.selectMemberChannel(member);
    }
  
    this.closeWindow();
  }
  

  /**
   * select a channel and then close the popup window
   */
  selectChannel(channel: Channel) {
    if (this.dmTag) {
      this.taggingService.selectChannelDirectMessage(channel);
    } else if (this.isFromThread) {

    } else if (this.isNewMessage) {

    } else if(this.isFromChannel) {

    }
  
    this.closeWindow();
  }


  /**
   * close the popup window
   */
  closeWindow() {
    this.closePopup.emit();
  }
}
