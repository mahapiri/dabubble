import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../services/user.service';
import { User } from '../../../models/user.class';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Channel, ChannelMember } from '../../../models/channel.class';
import { ChannelService } from '../../services/channel.service';
import { arrayUnion, doc, Firestore, updateDoc } from '@angular/fire/firestore';
import { ClickOutsideDirective } from '../../directive/click-outside.directive';
import { Subscription } from 'rxjs';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-add-member',
  standalone: true,
  imports: [MatIconModule, FormsModule, CommonModule, ClickOutsideDirective],
  templateUrl: './add-member.component.html',
  styleUrl: './add-member.component.scss',
})
export class AddMemberComponent {
  @Output() clickedAddMembers = new EventEmitter<boolean>();
  @Input() channel!: Channel;

  firestore: Firestore = inject(Firestore);
  userService: UserService = inject(UserService);
  channelService: ChannelService = inject(ChannelService);
  chatService: ChatService = inject(ChatService);
  searchMember: string = '';
  userlistOpen: boolean = false;
  selectedUsersForChannel: User[] = [];
  showUser: User[] = [];
  channelMember: ChannelMember[] = [];
  usersNotInChannel: User[] = [];
  isEditChannelPopup: boolean = false;
  subscription: Subscription = new Subscription();

  ngOnInit() {
    this.getChannelMember();
    this.userService.userArray.forEach(
      (user) => (user.chosenToChannel = false)
    );
    this.subscription = this.channelService.isEditChannelPopup$.subscribe(
      (value) => {
        this.isEditChannelPopup = value;
      }
    );
  }

  /**
   * gets all the members in the current channel
   */
  getChannelMember() {
    this.channel.channelMember.forEach((member) => {
      this.channelMember.push(member);
    });
  }

  /**
   * highlights the selected user
   * @param user the user which is clicked on in the list
   */
  selectMember(user: User) {
    user.chosenToChannel = !user.chosenToChannel;
    this.addSelectedUserToChannel(user);
  }

  /**
   * adds the marked users into the selectedUsersForChannel-array if they´re not already in it
   * @param user the user which schould be added to the channel
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
   * shows the member which can be added to the channel and
   */
  showMember() {
    this.userlistOpen = true;
    this.usersNotInChannel = this.getNotIncludedMembers(
      this.userService.userArray
    );
    this.showUser = this.usersNotInChannel;
    if (this.searchMember == '') {
      this.showUser = this.usersNotInChannel;
    } else {
      this.showUser = this.usersNotInChannel.filter((user) => {
        return user.username
          .toLowerCase()
          .includes(this.searchMember.toLowerCase());
      });
    }
  }

  /**
   * gets an array of users which are not already in the channel
   * @param allUsers array of all the users in DABubble
   * @returns array of users which are not already in the channel
   */
  getNotIncludedMembers(allUsers: User[]) {
    let selectedUsers: any = [];
    let allMemberIds = allUsers.map((user) => user.userId);
    let chanelMemberIds = this.channelMember.map((user) => user.userId);
    let difference = allMemberIds.filter((id) => !chanelMemberIds.includes(id));
    difference.forEach((user) =>
      allUsers.forEach((allUser) => {
        if (allUser.userId == user) {
          selectedUsers.push(allUser);
        }
      })
    );
    return selectedUsers;
  }

  /**
   * adds the marked users to the channel document in the firestore database and adds the channelId to the newly added user
   */
  addUserToActiveChannel() {
    this.selectedUsersForChannel.forEach(async (user) => {
      if (this.channelService.channelID) {
        await updateDoc(
          doc(this.firestore, 'channels', this.channelService.channelID),
          {
            channelMember: arrayUnion(this.addUserCredentialsToChannel(user)),
          }
        );
      }
      await updateDoc(doc(this.firestore, 'users', user.userId), {
        userChannels: arrayUnion(this.channelService.channelID),
      });
    });
    this.closeWindow();
  }

  addUserCredentialsToChannel(user: User) {
    return {
      username: user.username,
      userId: user.userId,
      email: user.email,
      state: user.state,
      userChannels: user.userChannels,
      profileImage: user.profileImage,
    };
  }

  /**
   * closes the add-User window
   */
  closeWindow() {
    this.selectedUsersForChannel = [];

    if (!this.isEditChannelPopup) {
      this.channelService.clickedAddMembers = false;
    } else {
      this.channelService.animationState = 'closing';
      setTimeout(() => {
        this.channelService.clickedAddMembers = false;
        this.channelService.animationState = 'none';
      }, 150); // Time of the slide-out Animation
    }
    this.channelService.closePopup();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
