import { Component, inject, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { Channel } from '../../../../models/channel.class';
import { ChannelMessageService } from '../../../services/channel-message.service';
import { UploadService } from '../../../services/upload.service';

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
  uploadService: UploadService = inject(UploadService);


  messageText: string = '';
  imgName: string = ''

  constructor(private channelMessageService: ChannelMessageService) { }

  /** Sends the text in the input field to the Channel Collection in the Backend. Trims the message from whitespace, ensures input is not empty, clears the input field after send */
  async sendMessage() {
    await this.checkPictureUpload();
    if (this.messageText.trim()) {
      await this.channelMessageService.addMessage(this.messageText);
      this.messageText = '';
    }
  }

  async chooseFile(path: string, event: Event) {
    this.uploadService.onFileSelected(path, event)
  }

  async checkPictureUpload() {
    if (this.uploadService.fileChosen) {
      await this.uploadService.uploadPicture();
      this.messageText = this.uploadService.downloadURL;
    }
  }
}
