import { Component, EventEmitter, inject, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../services/user.service';
import { User } from '../../../models/user.class';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChannelMember } from '../../../models/channel.class';
import { ChannelService } from '../../services/channel.service';

@Component({
  selector: 'app-add-member',
  standalone: true,
  imports: [MatIconModule, FormsModule, CommonModule],
  templateUrl: './add-member.component.html',
  styleUrl: './add-member.component.scss'
})
export class AddMemberComponent {
  @Output() clickedAddMembers = new EventEmitter<boolean>();
  userService: UserService = inject(UserService);
  channelService: ChannelService = inject(ChannelService);
  searchMember: string = "";
  userlistOpen: boolean = false;
  showUser: User[] = [];
  channelMember: ChannelMember[] = [];
  usersNotInChannel: any [] = [];

  ngOnInit() {
    this.getChannelMember();
  }

  getChannelMember() {
    this.channelService.selectedChannel$.forEach((channel) => {
      (channel?.channelMember)?.forEach((member) => {
        this.channelMember.push(member)
      })
    })
  }

  showMember() {
    this.userlistOpen = true;
    this.usersNotInChannel = this.getNotIncludedMembers(this.userService.userArray)
    this.showUser = this.usersNotInChannel;
    if (this.searchMember == "") {
      this.showUser = this.usersNotInChannel;
    }
    else {
      this.showUser = this.usersNotInChannel.filter(user => { return user.username.toLowerCase().includes(this.searchMember.toLowerCase()) })
    }
  }

  getNotIncludedMembers(allUsers: User[]) {
    let selectedUsers: any = [];
    let allMemberIds = allUsers.map((user) => user.userId)
    let chanelMemberIds = this.channelMember.map((user) => user.userId)
    let difference = allMemberIds.filter(id => !chanelMemberIds.includes(id));
    difference.forEach((user) => allUsers.forEach((allUser) => {
      if (allUser.userId == user) {
        selectedUsers.push(allUser)
      }
    }))
    return selectedUsers
  }

  addMemberToChannel() {

  }

  closeWindow() {
    this.clickedAddMembers.emit(false)
  }
}
