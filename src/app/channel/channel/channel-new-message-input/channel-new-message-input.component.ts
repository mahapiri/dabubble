import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ChannelService } from '../../../services/channel.service';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-channel-new-message-input',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatInputModule],
  templateUrl: './channel-new-message-input.component.html',
  styleUrl: './channel-new-message-input.component.scss',
})
export class ChannelNewMessageInputComponent {
  channelService: ChannelService = inject(ChannelService);

  sendMessage() {
    this.channelService.addMessageInChannel();
  }
}
