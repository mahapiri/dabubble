import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Output,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ChannelService } from '../../services/channel.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChannelMember } from '../../../models/channel.class';
import { ClickOutsideDirective } from '../../directive/click-outside.directive';
import { SharedService } from '../../services/shared.service';
import { ChatService } from '../../services/chat.service';
import { Subscription } from 'rxjs';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-member',
  standalone: true,
  imports: [MatIconModule, FormsModule, CommonModule, ClickOutsideDirective],
  templateUrl: './member.component.html',
  styleUrl: './member.component.scss',
})
export class MemberComponent {
  channelService: ChannelService = inject(ChannelService);
  sharedService: SharedService = inject(SharedService);
  userService: UserService = inject(UserService);
  chatService: ChatService = inject(ChatService);
  changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);

  @Output() clickedMembers = new EventEmitter<boolean>();
  @Output() switchToAddMembers = new EventEmitter<boolean>();

  subscription: Subscription = new Subscription();
  channelMember: ChannelMember[] = [];
  isEditChannelPopup: boolean = false;
  userList$ = this.userService.userList$;

  ngOnInit() {
    this.getChannelMember();

    this.subscription = this.channelService.isEditChannelPopup$.subscribe(
      (value) => {
        this.isEditChannelPopup = value;
        this.changeDetectorRef.detectChanges();
      }
    );
  }

  /**
   * Retrieves the members of a selected channel and updates the channel member array. By Iterating over the members of the selected channel, setting the profile state of each member using `setActualProfileState` and adding them to the `channelMember` array.
   */
  getChannelMember() {
    this.channelMember = [];
    this.channelService.selectedChannel$.forEach((channel) => {
      channel?.channelMember?.forEach((member) => {
        this.setActualProfileState(member);
        this.channelMember.push(member);
      });
    });
  }

  /**
   * Updates the profile state of a channel member by subscribing to the `userList$` observable.
   * Checks if the `userId` matches any user in the list. If so, updates the member's state to match the user's current state.
   * @param {ChannelMember} member - The channel member.
   */
  setActualProfileState(member: ChannelMember) {
    this.userList$.subscribe((user) => {
      user.forEach((profile) => {
        if (member.userId == profile.userId) {
          member.state = profile.state;
        }
      });
    });
  }

  /**
   * Handles the switch to the "Add Members" window and closes the current window. Updates the channel service with the "clicked Add Members" flag.
   * Sets the animation state to 'opening' for the mobile slider Version of this window.
   * @param {Event} event - The event that triggered the switch to "Add Members".
   */
  switchToAdd(event: Event) {
    event.stopPropagation();
    this.closeWindow();
    this.channelService.clickedAddMembers = true;
    this.channelService.animationState = 'opening';
  }

  /**
   * Closes the member popup/dialog, but only if its not within the context of the mobile Version of the EditChannel Window.
   */
  closeWindow() {
    if (!this.isEditChannelPopup) {
      this.channelService.closePopup();
    }
  }

  /**
   * Opens the profile of a channel member and closes the current window.
   * @param {Event} event - The event that triggered the profile opening.
   * @param {ChannelMember} member - The channel member of the profile.
   */
  openProfile(event: Event, member: ChannelMember) {
    event.stopPropagation();
    this.closeWindow();
    this.sharedService.openProfile(member.userId);
  }

  /** Cleans up the subscriptions when the component is destroyed */
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
