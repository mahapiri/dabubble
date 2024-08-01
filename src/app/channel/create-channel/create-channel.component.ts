import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ChannelService } from '../../services/channel.service';
import { UserService } from '../../services/user.service';
import { User } from '../../../models/user.class';
import { MatRadioModule } from '@angular/material/radio';

@Component({
  selector: 'app-create-channel',
  standalone: true,
  imports: [MatIconModule, CommonModule, FormsModule, MatRadioModule],
  templateUrl: './create-channel.component.html',
  styleUrl: './create-channel.component.scss',
})
export class CreateChannelComponent {
  @Output() clickedChannel = new EventEmitter<boolean>();
  channelService: ChannelService = inject(ChannelService);
  userService: UserService = inject(UserService);
  addUserChannelVisible: boolean = false;
  someUsersChecked: boolean = false;
  searchMember: string = "";
  userlistOpen: boolean = false;
  showUser: User[] = [];
  selectedUsersForChannel: User[] = [];
  usersToAdd: User[] = [];

  channelName: string = '';
  channelDescription: string = '';

  close() {
    this.clickedChannel.emit(false);
  }

  /**
   * leads from create channel window to add-member-window
   */
  nextPage() {
    this.addUserChannelVisible = !this.addUserChannelVisible;
    this.selectedUsersForChannel = []
    this.userService.getUserList();
  }

/**
 * detects the radio button and sets the someUsersChecked variable accordingly
 */
  onRadioChange(event: any): void {
    this.someUsersChecked = event.target.checked;
  }

  /**
   * shows a list of all members and allows to search individual members
   */
  showMember() {
    this.userlistOpen = true;
    this.showUser = this.userService.userArray;
    if (this.searchMember == "") {
      this.showUser = this.userService.userArray;
    }
    else {
      this.showUser = this.userService.userArray.filter(user => { return user.username.toLowerCase().includes(this.searchMember.toLowerCase()) })
    }
  }

  /**
   * sets a boolean variable to add a "selected" class
   * @param user the clicked User in the list
   */
  selectMember(user: User) {
    user.chosenToChannel = !user.chosenToChannel;
    this.addSelectedUserToChannel(user);
  }


/**
 * adds or removes the selected user to the selectedUsersForChannel array, 
 * @param user the clicked User in the list
 */
  addSelectedUserToChannel(user: User) {
    if (this.selectedUsersForChannel.includes(user)) {
      this.selectedUsersForChannel.splice(this.selectedUsersForChannel.indexOf(user), 1)
    }
    else {
      this.selectedUsersForChannel.push(user)
    }
  }

  /**
   * creates a new Channel with selected users or with all users, depending on the radio button
   */
  createChannel() {
    if (this.someUsersChecked) {
      this.usersToAdd = this.selectedUsersForChannel
    }
    else {
      this.usersToAdd = this.userService.userArray
    }
    this.channelService.addChannel(
      this.channelName,
      this.channelDescription,
      this.usersToAdd
    );
    this.close();
  }
}
