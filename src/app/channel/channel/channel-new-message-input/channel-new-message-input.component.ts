import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
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
import { ClickOutsideDirective } from '../../../directive/click-outside.directive';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { EmojiPickerComponent } from '../../../chat/emoji-picker/emoji-picker.component';
import { User } from '../../../../models/user.class';

@Component({
  selector: 'app-channel-new-message-input',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    FormsModule,
    TaggingComponent,
    ClickOutsideDirective,
    EmojiComponent,
    EmojiPickerComponent,
  ],
  templateUrl: './channel-new-message-input.component.html',
  styleUrl: './channel-new-message-input.component.scss',
})
export class ChannelNewMessageInputComponent implements OnInit {
  public taggingService: TaggingService = inject(TaggingService);
  private taggingSubscription: Subscription = new Subscription();
  private channelSubscription: Subscription = new Subscription();

  @Input() channel!: Channel;
  @Output() messageCreated: EventEmitter<void> = new EventEmitter<void>();

  uploadService: UploadService = inject(UploadService);
  uploadPath: string = 'channel';

  messageText: string = '';
  isEmoji: boolean = false;
  notOpen: boolean = true;
  isTag: boolean = false;
  findTag: boolean = false;
  isAt: boolean = false;
  isHash: boolean = false;
  fileUrl: string = '';

  constructor(private channelMessageService: ChannelMessageService) {}

  /**
   * subscribes selected member
   */
  ngOnInit() {
    this.taggingSubscription =
      this.taggingService.memberSelectedChannel$.subscribe((member) => {
        if (member && member.username) {
          this.addMemberToMessage(member);
        }
      });

    this.channelSubscription =
      this.taggingService.channelSelectedChannel$.subscribe((channel) => {
        if (channel && channel.channelName) {
          this.addChannelToMessage(channel);
        }
      });
    this.messageText = ''; // testing
  }

  /**
   * add member to message field
   */
  addMemberToMessage(member: User) {
    let mention = member.username;

    if (this.findTag) {
      mention = `${mention} `;
      this.messageText += `${mention}`;
    } else {
      mention = `@${mention} `;
      this.messageText += ` ${mention}`;
    }
  }

  /**
   * add channel to message field
   */
  addChannelToMessage(channel: Channel) {
    let mention = channel.channelName;

    if (this.findTag) {
      mention = `${mention} `;
      this.messageText += `${mention}`;
    } else {
      mention = `#${mention} `;
      this.messageText += ` ${mention}`;
    }
  }

  /**
   * unsubscribes selected member
   */
  ngOnDestroy(): void {
    this.taggingSubscription.unsubscribe();
    this.channelSubscription.unsubscribe();
  }

  /** Sends the text and an uploaded image (if selected) in the input field to the Channel Collection in the Backend. Trims the message from whitespace, ensures input is not empty, clears the input field after send */
  async sendMessage() {
    this.fileUrl = await this.checkPictureUpload();

    if (this.messageText.trim() || this.fileUrl) {
      await this.channelMessageService.addMessage(
        this.messageText,
        this.fileUrl
      );
      this.messageText = '';
    }
    this.messageCreated.emit();
    this.uploadService.removeImg('file-upload');
  }

  /**
   * calls the onFileSelected method and sets the uploadPath to "channel"
   * @param event
   */
  async chooseFile(event: Event) {
    this.uploadService.onFileSelected(event, 'channel');
    this.uploadService.uploadPath = this.uploadPath;
  }

  /**
   * calls the upload method if a file was chosen and returns the download file or an empty string
   */
  async checkPictureUpload() {
    if (this.uploadService.channelFileChosen) {
      await this.uploadService.uploadPicture();
      return this.uploadService.downloadURL;
    }
    return '';
  }

  /**
   * open tagging popup
   */
  openPopup(event: Event) {
    event?.stopPropagation();
    this.isTag = !this.isTag;
    this.isAt = true;
  }

  /**
   * close tagging popup
   */
  closePopup() {
    this.isTag = false;
    this.findTag = false;
    this.isAt = false;
    this.isHash = false;
  }

  /**
   * sends the message if the message is valid and the Enter key is pressed
   * when Shift+Enter is pressed, a line break is inserted instead
   */
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  /**
   * open the Emoji Container
   */
  openEmojiSet(event: Event) {
    event.stopPropagation();
    if (this.notOpen) {
      this.isEmoji = !this.isEmoji;
    }
  }

  /**
   * open the Emoji Container
   */
  closeEmojiSet() {
    this.isEmoji = false;
    this.notOpen = false;
    setTimeout(() => (this.notOpen = true), 1000);
  }

  /**
   * handles emoji selection from the EmojiPickerComponent
   */
  onEmojiSelected(emoji: string) {
    this.messageText += emoji;
    this.closeEmojiSet();
  }

  /**
   * opens tagging
   */
  openTagging() {
    const lastChar = this.messageText.slice(-1);

    if (!this.findTag) {
      if (lastChar === '@') {
        this.findTag = true;
        this.isTag = true;
        this.isAt = true;
      }
      if (lastChar === '#') {
        this.findTag = true;
        this.isTag = true;
        this.isHash = true;
      }
    } else if (this.findTag) {
      if (!this.messageText.includes('@') && !this.messageText.includes('#')) {
        this.isTag = false;
        this.findTag = false;
        this.isAt = false;
        this.isHash = false;
      }
    }
  }
}
