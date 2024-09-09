import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Channel } from '../../../models/channel.class';
import {
  arrayRemove,
  doc,
  Firestore,
  runTransaction,
  updateDoc,
} from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { __values } from 'tslib';
import { Observable, Subscription } from 'rxjs';
import { User } from '../../../models/user.class';
import { ChannelService } from '../../services/channel.service';
import { ClickOutsideDirective } from '../../directive/click-outside.directive';
import { ChatService } from '../../services/chat.service';
import { MemberComponent } from '../../users/member/member.component';

@Component({
  selector: 'app-edit-channel',
  standalone: true,
  imports: [
    MatIconModule,
    FormsModule,
    CommonModule,
    ClickOutsideDirective,
    MemberComponent,
  ],
  templateUrl: './edit-channel.component.html',
  styleUrl: './edit-channel.component.scss',
})
export class EditChannelComponent {
  editing: boolean = false;
  firestore: Firestore = inject(Firestore);
  userService: UserService = inject(UserService);
  @Input() channel!: Channel;
  @Output() channelClosed = new EventEmitter<boolean>();
  currentUser: User = new User();
  subscription: Subscription = new Subscription();
  subscribeChannel: Subscription = new Subscription();
  activeChannel: Channel = new Channel({});
  selectedChannel$: Observable<Channel | null> =
    this.channelService.selectedChannel$;

  channelName: string = '';
  channelDescription: string = '';

  constructor(
    private channelService: ChannelService,
    public chatService: ChatService
  ) {
    this.subscribeChannel = this.selectedChannel$.subscribe((value) => {
      this.activeChannel = new Channel(value);
      this.channelName = this.activeChannel.channelName;
      this.channelDescription = this.activeChannel.description;
    });
  }

  ngOnInit() {
    this.channelService.setIsEditChannelPopup(true);

    this.subscription = this.userService.currentUser$.subscribe((value) => {
      if (value) {
        this.currentUser = value;
      }
    });
  }

  /**
   * deletes the current user from the channel
   */
  async deleteUserFromChannel() {
    if (this.channel.channelID) {
      let reducedArray = this.createArrayWithoutUser();
      const channelRef = doc(
        this.firestore,
        'channels',
        this.channel.channelID
      );
      const userRef = doc(this.firestore, 'users', this.currentUser.userId);

      await runTransaction(this.firestore, async (transaction) => {
        transaction.update(channelRef, {
          channelMember: reducedArray,
        });
        transaction.update(userRef, {
          userChannels: arrayRemove(this.channel.channelID),
        });
      });
    }
  }

  /**
   * subtracts the current user from all the users in the channel
   * @returns an array of the users in the channel without the current user
   */
  createArrayWithoutUser() {
    return this.channel.channelMember.filter(
      (member) => member.userId !== this.currentUser.userId
    );
  }

  /**
   * opens and closes the edit window
   */
  edit() {
    this.editing = !this.editing;
    this.saveChanges();
  }

  /**
   * updates the channe name or description if its changed by the user
   */
  async saveChanges() {
    if (this.channel.channelID) {
      await updateDoc(doc(this.firestore, 'channels', this.channel.channelID), {
        channelName: this.channelName,
        description: this.channelDescription,
      });
    }
    this.channelService.loadChannels();
  }

  /**
   * closes the channel-window
   */
  closeChannel() {
    this.channelService.closePopup();
  }

  /**
   * Clean up subscriptions when the component is destroyed.
   */
  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.subscribeChannel.unsubscribe();
  }
}
