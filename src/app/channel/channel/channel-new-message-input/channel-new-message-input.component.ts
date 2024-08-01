import { Component, Input, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ChannelService } from '../../../services/channel.service';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { Channel } from '../../../../models/channel.class';

@Component({
  selector: 'app-channel-new-message-input',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    FormsModule,
  ],
  templateUrl: './channel-new-message-input.component.html',
  styleUrl: './channel-new-message-input.component.scss',
})
export class ChannelNewMessageInputComponent {
  @Input() channel!: Channel;

  messageText: string = '';

  constructor(private channelService: ChannelService) {}

  /** Sends the text in the input field to the Channel Collection in the Backend. Trims the message from whitespace, ensures input is not empty, clears the input field after send */
  async sendMessage() {
    console.log('Message text:', this.messageText);
    if (this.messageText.trim()) {
      await this.channelService.addMessage(this.messageText);
      this.messageText = '';
    }
  }
}
