import {
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { UploadService } from '../../services/upload.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmojiPickerComponent } from '../../chat/emoji-picker/emoji-picker.component';
import { MatButtonModule } from '@angular/material/button';
import { TaggingComponent } from '../../chat/tagging/tagging.component';
import { ClickOutsideDirective } from '../../directive/click-outside.directive';
import { NewMessageService } from '../../services/new-message.service';
import { ChatService } from '../../services/chat.service';
import { ChannelService } from '../../services/channel.service';
import { SharedService } from '../../services/shared.service';
import { Channel } from '../../../models/channel.class';
import { ChannelMessageService } from '../../services/channel-message.service';
import { Subscription, take } from 'rxjs';
import { DirectMessageService } from '../../services/direct-message.service';
import { UserService } from '../../services/user.service';
import { User } from '../../../models/user.class';
import { TaggingService } from '../../services/tagging.service';

@Component({
  selector: 'app-new-message-input',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    EmojiPickerComponent,
    MatButtonModule,
    TaggingComponent,
    ClickOutsideDirective,
  ],
  templateUrl: './new-message-input.component.html',
  styleUrl: './new-message-input.component.scss',
})
export class NewMessageInputComponent implements OnInit, OnDestroy {
  public uploadService: UploadService = inject(UploadService);
  public newMessageService: NewMessageService = inject(NewMessageService);
  public chatService: ChatService = inject(ChatService);
  public taggingService: TaggingService = inject(TaggingService);
  public channelMessageService: ChannelMessageService = inject(
    ChannelMessageService
  );
  public directMessageService: DirectMessageService =
    inject(DirectMessageService);
  public channelService: ChannelService = inject(ChannelService);
  public userService: UserService = inject(UserService);
  public sharedService: SharedService = inject(SharedService);
  private messageIdSubscription: Subscription = new Subscription();
  private searchWordSubscription: Subscription = new Subscription();
  private taggingSubscription: Subscription = new Subscription();
  private channelSubscription: Subscription = new Subscription();
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  messageText: string = '';
  uploadPath: string = 'new-message';
  isEmoji: boolean = false;
  notOpen: boolean = true;
  isTag: boolean = false;
  findTag: boolean = false;
  isAt: boolean = false;
  isHash: boolean = false;
  searchword: string = '';
  fileUrl: string = '';

  constructor() {
    this.newMessageService.isChannel = false;
  }

  ngOnInit(): void {
    this.searchWordSubscription = this.newMessageService.searchword$.subscribe(
      (word) => {
        this.searchword = word;
        if (this.newMessageService.isChannel && this.searchword.length == 0) {
          this.newMessageService.isChannel = false;
        }
      }
    );

    this.taggingSubscription =
      this.taggingService.memberSelectedNewMessage$.subscribe((member) => {
        if (member && member.username) {
          this.addMemberToMessage(member);
        }
      });

    this.channelSubscription =
      this.taggingService.channelSelectedNewMessage$.subscribe((channel) => {
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
   * This method unsubscribes from active subscriptions to prevent memory leaks.
   */
  ngOnDestroy(): void {
    this.searchWordSubscription.unsubscribe();
    this.messageIdSubscription.unsubscribe();
    this.taggingSubscription.unsubscribe();
    this.channelSubscription.unsubscribe();
    this.messageText = '';
  }

  /**
   * sends the message if the message is valid and the Enter key is pressed
   * when Shift+Enter is pressed, a line break is inserted instead
   */
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.createMessage();
    }
  }

  /**
   * Handles file selection for uploading.
   */
  async chooseFile(event: Event) {
    this.uploadService.onFileSelected(event, 'newMessage');
    this.uploadService.uploadPath = this.uploadPath;
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
   * close the Emoji Container
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
   * checks the valid of a message to start the newDmMessage function
   */
  async createMessage() {
    this.fileUrl = await this.checkPictureUpload();

    if (this.messageText.trim() || this.fileUrl) {
      this.messageIdSubscription = this.newMessageService.messageId$
        .pipe(take(1))
        .subscribe(async (id) => {
          if (this.newMessageService.isChannel && id) {
            const channel = await this.channelService.getChannelById(id);

            if (channel) {
              this.createChannelMsg(channel, this.fileUrl);
            }
          } else if (!this.newMessageService.isChannel && id) {
            const profile = await this.userService.getUserById(id);
            if (profile) {
              this.createUserMsg(profile, this.fileUrl);
            }
          }
        });
    }
    //this.uploadService.removeImg('new-message-file-upload');
    setTimeout(() => this.messageIdSubscription.unsubscribe(), 100);
  }

  /**
   * Creates a direct message with the specified user profile.
   * @param profile
   */
  async createUserMsg(profile: User, fileUrl: string) {
    this.sharedService.setSelectProfile(true);
    await this.directMessageService.openDmFromUser(profile);
    this.chatService.setIsChannel(false);
    this.sharedService.setIsNewMessage(false);
    this.sharedService.setClickedNewMessage(false);
    this.sharedService.setSelectedUserIndex(profile.userId);
    this.cdr.detectChanges();
    this.sendMessage(fileUrl);
    setTimeout(() => {
      this.chatService.handleWindowChangeOnMobile();
    }, 0);
  }

  /**
   * Initiates a message creation for the specified channel.
   * @param channel
   */
  createChannelMsg(channel: Channel, fileUrl: string) {
    this.sharedService.setIsNewMessage(false);

    this.channelService.loadChannels();
    this.cdr.detectChanges();
    this.channelService.setSelectedChannel(channel);
    this.sharedService.setSelectProfile(false);
    this.chatService.setIsChannel(true);
    this.sharedService.setIsNewMessage(false);
    this.sharedService.setClickedNewMessage(false);
    this.sendMessage(fileUrl);
    setTimeout(() => {
      this.chatService.handleWindowChangeOnMobile();
    }, 0);
  }

  /**
   * Sends a message based on the current chat context.
   */
  async sendMessage(fileUrl: string) {
    if (this.messageText.trim() || this.fileUrl) {
      if (this.chatService.isChannel) {
        await this.channelMessageService.addMessage(
          this.messageText,
          this.fileUrl
        );
      } else {
        await this.directMessageService.newDmMessage(
          this.messageText,
          this.fileUrl
        );
      }
      this.messageText = '';
    }
    this.cdr.detectChanges();
  }

  /**
   * calls the upload method if a file was chosen and saves the dawnload URL of the file to the messageText
   */
  async checkPictureUpload() {
    if (this.uploadService.newMessageFileChosen) {
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
