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
  someUsers: boolean = false;
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

  nextPage() {
    this.addUserChannelVisible = !this.addUserChannelVisible;
    this.selectedUsersForChannel = []
  }

  onRadioChange(event: any): void {
    this.someUsers = event.target.checked;
  }

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
  selectMember(user: User) {
    user.chosenToChannel = !user.chosenToChannel;
    this.addSelectedUserToChannel(user);
  }

  addSelectedUserToChannel(user: User) {
    if (this.selectedUsersForChannel.includes(user)) {
      this.selectedUsersForChannel.splice(this.selectedUsersForChannel.indexOf(user), 1)
    }
    else {
      this.selectedUsersForChannel.push(user)
    }
  }





  createChannel() {
    if (this.someUsers) {
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
