import { Component, inject, Input, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { Channel } from '../../../../models/channel.class';
import { ChannelMessageService } from '../../../services/channel-message.service';
import { UploadService } from '../../../services/upload.service';
import { TaggingComponent } from '../../../chat/tagging/tagging.component';
import { TaggingService } from '../../../services/tagging.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-channel-new-message-input',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    FormsModule,
    TaggingComponent
  ],
  templateUrl: './channel-new-message-input.component.html',
  styleUrl: './channel-new-message-input.component.scss',
})
export class ChannelNewMessageInputComponent implements OnInit{
  public taggingService: TaggingService = inject(TaggingService);
  private taggingSubscription: Subscription = new Subscription();
  @Input() channel!: Channel;
  uploadService: UploadService = inject(UploadService);
  uploadPath: string = 'channel'


  messageText: string = '';
  imgName: string = ''
  isTag: boolean = false;

  constructor(private channelMessageService: ChannelMessageService) { }

  /**
   * subscribes selected member
   */
  ngOnInit() {
    this.taggingSubscription = this.taggingService.memberSelected$.subscribe((member) => {
      if (member && member.username) {
        this.addMemberToMessage(member.username);
      }
    });
  }


  /**
   * add member to message field
   */
  addMemberToMessage(username: string) {
    const mention = `@${username} `;
    if (!this.messageText.includes(mention)) {
      this.messageText += ` ${mention}`; 
    }
  }


  /**
   * unsubscribes selected member
   */
  ngOnDestroy(): void {
    this.taggingSubscription.unsubscribe();
  }


  /** Sends the text in the input field to the Channel Collection in the Backend. Trims the message from whitespace, ensures input is not empty, clears the input field after send */
  async sendMessage() {
    await this.checkPictureUpload();
    if (this.messageText.trim()) {
      await this.channelMessageService.addMessage(this.messageText);
      this.messageText = '';
    }
  }

  async chooseFile(event: Event) {
    this.uploadService.onFileSelected(event)
    this.uploadService.uploadPath = this.uploadPath;
  }

  async checkPictureUpload() {
    if (this.uploadService.fileChosen) {
      await this.uploadService.uploadPicture();
      this.messageText = this.uploadService.downloadURL;
    }
  }

  /**
   * open tagging popup
   */
  openPopup(event: Event) {
    event?.stopPropagation();
    this.isTag = !this.isTag;
  }


  /**
   * close tagging popup
   */
  closePopup() {
    this.isTag = false;
  }
}
