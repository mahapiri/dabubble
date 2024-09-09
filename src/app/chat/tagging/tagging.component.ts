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
import { ChannelMember } from '../../../models/channel.class';

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
  currentUser: any;
  @Input() isFromThread: boolean = false;
  @Input() isNewMessage: boolean = false;

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
  }

  /**
   * unsubscribes the current user
   */
  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
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
   * select a member and then close the popup window
   */
  selectMemberToChannel(member: ChannelMember) {
    if (this.isFromThread) {
      this.taggingService.selectMemberThread(member);
    } else if (!this.isFromThread) {
      this.taggingService.selectMemberChannel(member);
    } else if (this.isNewMessage) {
      this.taggingService.selectMemberNewMessage(member);
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
