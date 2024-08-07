import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Channel } from '../../../models/channel.class';
import {
  arrayRemove,
  deleteField,
  doc,
  FieldValue,
  Firestore,
  updateDoc,
} from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { __values } from 'tslib';
import { Subscription } from 'rxjs';
import { User } from '../../../models/user.class';


@Component({
  selector: 'app-edit-channel',
  standalone: true,
  imports: [MatIconModule, FormsModule, CommonModule],
  templateUrl: './edit-channel.component.html',
  styleUrl: './edit-channel.component.scss',
})
export class EditChannelComponent {
  editing: boolean = false;
  firestore: Firestore = inject(Firestore);
  @Input() channel!: Channel;
  @Output() channelClosed = new EventEmitter<boolean>();
  userService: UserService = inject(UserService);
  currentUser: User = new User();
  subscription: Subscription = new Subscription();


  ngOnInit() {
    this.subscription = this.userService.currentUser$.subscribe((value) => {
      if (value) {
        this.currentUser = value;
      }
    });
  }


  async deleteUserFromChannel() {
    if (this.channel.channelID) {
      let allMember = this.channel.channelMember;
      allMember.forEach((member, index) => {
        if (member.userId === this.currentUser.userId) {
          allMember.splice(index, 1);
        }
      });
    }
  }


  edit() {
    this.editing = !this.editing;
    this.saveChanges();
  }


  async saveChanges() {
    if (this.channel.channelID) {
      await updateDoc(doc(this.firestore, 'channels', this.channel.channelID), {
        channelName: this.channel.channelName,
        description: this.channel.description,
      });
    }
  }


  closeChannel() {
    this.channelClosed.emit(false);
  }


  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
