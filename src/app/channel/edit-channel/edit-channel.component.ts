import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Channel } from '../../../models/channel.class';
import { doc, Firestore, updateDoc } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-channel',
  standalone: true,
  imports: [MatIconModule, FormsModule, CommonModule],
  templateUrl: './edit-channel.component.html',
  styleUrl: './edit-channel.component.scss'
})
export class EditChannelComponent {
  editing: boolean = false;
  firestore: Firestore = inject(Firestore);
  @Input() channel!: Channel;
  @Output() channelClosed = new EventEmitter<boolean>();

  edit() {
    this.editing = !this.editing;
    this.saveChanges()
  }

  async saveChanges() {
    if (this.channel.channelID) {
      await updateDoc(doc(this.firestore, "channels", this.channel.channelID), {
        channelName: this.channel.channelName,
        description: this.channel.description
      });
    }
  }

  closeChannel() {
    this.channelClosed.emit(false)
  }


}
