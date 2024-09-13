import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ChannelService } from '../../services/channel.service';
import { UserService } from '../../services/user.service';
import { User } from '../../../models/user.class';
import { MatRadioModule } from '@angular/material/radio';
import { ClickOutsideDirective } from '../../directive/click-outside.directive';

@Component({
  selector: 'app-create-channel',
  standalone: true,
  imports: [
    MatIconModule,
    CommonModule,
    FormsModule,
    MatRadioModule,
    ClickOutsideDirective,
  ],
  templateUrl: './create-channel.component.html',
  styleUrl: './create-channel.component.scss',
})
export class CreateChannelComponent {
  @Output() clickedChannel = new EventEmitter<boolean>();
  channelService: ChannelService = inject(ChannelService);
  userService: UserService = inject(UserService);
  addUserChannelVisible: boolean = false;
  selectedOption: string = 'allUsers';
  someUsersChecked: boolean = false;
  allUsersChecked: boolean = false;
  searchMember: string = '';
  userlistOpen: boolean = false;
  showUser: User[] = [];
  selectedUsersForChannel: User[] = [];
  usersToAdd: User[] = [];
  currentUser!: User;
  channelName: string = '';
  channelDescription: string = '';

  constructor() {
    this.userService.currentUser$.subscribe((user) => {
      if (user) {
        this.currentUser = user;
      }
    });
  }

  close() {
    this.clickedChannel.emit(false);
  }

  /**
   * leads from create channel window to add-member-window
   */
  nextPage() {
    this.addUserChannelVisible = !this.addUserChannelVisible;
    this.selectedUsersForChannel = [];
    this.userService.getUserList();
  }

  /**
   * detects the radio button and sets the someUsersChecked variable accordingly
   */
  onRadioChange(): void {
    // console.log("some", this.someUsersChecked, "all", this.allUsersChecked);

    if (this.selectedOption === 'allUsers') {
      this.allUsersChecked = true;
      this.someUsersChecked = false;
    } else if (this.selectedOption === 'someUsers') {
      this.allUsersChecked = false;
      this.someUsersChecked = true;
    }
  }

  /**
   * shows a list of all members and allows to search individual members
   */
  showMember() {
    this.userlistOpen = true;
    this.showUser = this.removeCurrentUserFromArray();
    if (this.searchMember == '' && this.someUsersChecked) {
      this.showUser = this.removeCurrentUserFromArray();
    } else {
      this.showUser = this.removeCurrentUserFromArray().filter((user) => {
        return user.username
          .toLowerCase()
          .includes(this.searchMember.toLowerCase());
      });
    }
  }

  removeCurrentUserFromArray() {
    return this.userService.userArray.filter(
      (user) => user.userId !== this.currentUser.userId
    );
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
      this.selectedUsersForChannel.splice(
        this.selectedUsersForChannel.indexOf(user),
        1
      );
    } else {
      this.selectedUsersForChannel.push(user);
    }
  }

  /**
   * creates a new Channel with selected users or with all users, depending on the radio button
   */
  createChannel() {
    if (this.someUsersChecked) {
      this.addSelectedUserToChannel(this.currentUser);
      this.usersToAdd = this.selectedUsersForChannel;
    } else {
      this.usersToAdd = this.userService.userArray;
    }

    this.channelService.addChannel(
      this.channelName,
      this.channelDescription,
      this.usersToAdd
    );
    this.close();
  }
}
