import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { User } from '../../../models/user.class';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { doc, Firestore, updateDoc } from '@angular/fire/firestore';
import { ChannelService } from '../../services/channel.service';
import { Channel } from '../../../models/channel.class';
import { ClickOutsideDirective } from '../../directive/click-outside.directive';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [MatIconModule, CommonModule, FormsModule, ClickOutsideDirective],
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.scss'
})
export class MyProfileComponent implements OnInit {
  @Input() clickedProfile: boolean = false;
  @Output() clickedProfileChange = new EventEmitter<boolean>();
  firestore: Firestore = inject(Firestore);
  userService: UserService = inject(UserService);
  channelService: ChannelService = inject(ChannelService);
  sharedService: SharedService = inject(SharedService);
  currentUser: User | null = null;
  editing: boolean = false;
  userName: string = '';
  userMail: string = '';

  constructor() { }

  /**
   * Initializes the component and subscribes to the current user.
   * Sets the user's name and email fields for editing.
   */
  async ngOnInit() {
    this.userService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      if (this.currentUser) {
        this.userName = this.currentUser.username
        this.userMail = this.currentUser.email
      }
    });
  }


  /**
   * Closes the profile view and resets the state of the profile.
   */
  closeProfile() {
    this.clickedProfileChange.emit(false);
    this.sharedService.isMyProfile = false;
  }


  /**
   * toggles the editing state for the user's profile information.
   * Also updates the user data in the Firestore.
   * @param event - The event triggered by the edit button.
   */
  edit(event: Event) {
    event.stopPropagation();
    this.editing = !this.editing;
    this.updataUserDatabase();
  }


  /**
   * Updates the user's name and email in the Firestore.
   * Also updates the username in each channel the user is a member of.
   */
  async updataUserDatabase() {
    if (this.currentUser) {
      await updateDoc(doc(this.firestore, 'users', this.currentUser.userId), {
        username: this.userName,
        email: this.userMail,
      });
      const userChannels = this.currentUser?.userChannels
      for (const channelID of userChannels) {
        await this.channelService.getChannelById(channelID).then((channel) => {
          if (channel) {
            this.changeUsernameInChannel(channel)
          }
        })
      }
    }
  }


  /**
   * Updates the username for the current user in the given channel.
   * @param channel - The channel object where the username needs to be updated.
   */
  async changeUsernameInChannel(channel: Channel) {
    if (channel.channelID) {
      let channelWithChangedName = this.changeNameInChannel(channel);
      const channelRef = doc(this.firestore, "channels", channel.channelID);
      await updateDoc(channelRef, {
        channelMember: channelWithChangedName.channelMember
      });
    }
  }


  /**
   * Updates the username in the `channelMember` array of a channel.
   * @param channel - The channel object to update.
   * @returns 
   */
  changeNameInChannel(channel: Channel): Channel {
    channel.channelMember.forEach((channelmember) => {
      if (channelmember.userId == this.currentUser?.userId) {
        channelmember.username = this.userName;
      }
    })
    return channel
  }


  /**
   * Returns the status text for the user's online status.
   * @param status - The user's status (e.g., 'online', 'offline', 'absent').
   * @returns 
   */
  getStatusText(status: string | undefined): string {
    switch (status) {
      case 'online':
        return 'Online';
      case 'offline':
        return 'Offline';
      case 'absent':
        return 'Abwesend';
      default:
        return '';
    }
  }


  /**
   * Cancels the editing mode without saving changes.
   * @param event - The event triggered by the cancel button.
   */
  cancel(event: Event) {
    event.stopPropagation();
    this.editing = false;
  }
}
