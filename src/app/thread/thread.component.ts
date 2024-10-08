import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { EditChannelComponent } from '../channel/edit-channel/edit-channel.component';
import { CommonModule } from '@angular/common';
import { MemberComponent } from '../users/member/member.component';
import { Observable, Subscription } from 'rxjs';
import { ThreadService } from '../services/thread.service';
import { Thread, ThreadMessage } from '../../models/thread.class';
import { ChatService } from '../services/chat.service';
import { ThreadMessageService } from '../services/thread-message.service';
import { FormsModule } from '@angular/forms';
import { ThreadMessageComponent } from './thread-message/thread-message.component';
import { UploadService } from '../services/upload.service';
import { TaggingComponent } from '../chat/tagging/tagging.component';
import { TaggingService } from '../services/tagging.service';
import { ClickOutsideDirective } from '../directive/click-outside.directive';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { EmojiPickerComponent } from '../chat/emoji-picker/emoji-picker.component';
import { User } from '../../models/user.class';
import { Channel } from '../../models/channel.class';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    MatInputModule,
    MatListModule,
    EditChannelComponent,
    ThreadMessageComponent,
    CommonModule,
    MemberComponent,
    FormsModule,
    TaggingComponent,
    ClickOutsideDirective,
    EmojiComponent,
    EmojiPickerComponent,
  ],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss',
})
export class ThreadComponent implements OnInit, OnDestroy {
  @Output() clickedCloseThread = new EventEmitter<boolean>();
  @Input() thread!: Thread;
  @ViewChild('messageContainer') private messageContainer!: ElementRef;
  @Output() messageCreated: EventEmitter<void> = new EventEmitter<void>();

  uploadService: UploadService = inject(UploadService);
  public taggingService: TaggingService = inject(TaggingService);
  private taggingSubscription: Subscription = new Subscription();
  private channelSubscription: Subscription = new Subscription();
  uploadPath: string = 'threads';

  threadMessageText: string = '';
  isEmoji: boolean = false;
  notOpen: boolean = true;
  isTag: boolean = false;
  findTag: boolean = false;
  isAt: boolean = false;
  isHash: boolean = false;
  fileUrl: string = '';

  selectedThread$: Observable<Thread | null>;
  threadMessages$: Observable<ThreadMessage[]>;

  public answerCount: number = 0;

  constructor(
    private threadService: ThreadService,
    private threadMessageService: ThreadMessageService,
    public chatService: ChatService
  ) {
    this.selectedThread$ = this.threadService.selectedThread$;
    this.threadMessages$ = this.threadMessageService.threadMessages$;
  }

  ngOnInit() {
    this.threadMessageService.answerCount$.subscribe((count) => {
      this.answerCount = count;
    });

    this.taggingSubscription =
      this.taggingService.memberSelectedThread$.subscribe((member) => {
        if (member && member.username) {
          this.addMemberToMessage(member);
        }
      });

    this.channelSubscription =
      this.taggingService.channelSelectedThread$.subscribe((channel) => {
        if (channel && channel.channelName) {
          this.addChannelToMessage(channel);
        }
      });

    this.scrollToBottom();
  }

  /**
   * scroll to latest message
   */
  scrollToBottom(): void {
    setTimeout(() => {
      const container = this.messageContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    }, 1000);
  }

  /**
   * Triggered when a new message is created to the bottom
   */
  onMessageCreated() {
    this.scrollToBottom();
  }

  /**
   * unsubscribes selected member
   */
  ngOnDestroy(): void {
    this.taggingSubscription.unsubscribe();
    this.channelSubscription.unsubscribe();
  }

  /**
   * add member to message field
   */
  addMemberToMessage(member: User) {
    let mention = member.username;

    if (this.findTag) {
      mention = `${mention} `;
      this.threadMessageText += `${mention}`;
    } else {
      mention = `@${mention} `;
      this.threadMessageText += ` ${mention}`;
    }
  }

  /**
   * add channel to message field
   */
  addChannelToMessage(channel: Channel) {
    let mention = channel.channelName;

    if (this.findTag) {
      mention = `${mention} `;
      this.threadMessageText += `${mention}`;
    } else {
      mention = `#${mention} `;
      this.threadMessageText += ` ${mention}`;
    }
  }

  /**
   * calls the onFileSelected method and sets the uploadPath to "channel"
   * @param event
   */
  async chooseFile(event: Event) {
    this.uploadService.onFileSelected(event, 'thread');
    this.uploadService.uploadPath = this.uploadPath;
  }

  /**
   * calls the upload method if a file was chosen and saves the dawnload URL of the file to the threadMessageText
   */
  async checkPictureUpload() {
    if (this.uploadService.threadFileChosen) {
      await this.uploadService.uploadPicture();
      return this.uploadService.downloadURL;
    }
    return '';
  }

  /**
   * Closes the current thread and updates the view.
   */
  closeThread() {
    this.clickedCloseThread.emit(false);
    this.chatService.showComponentOnMobile('channel');
  }

  /** Sends the text in the input field to the Thread Collection in the Backend. Trims the message from whitespace, ensures input is not empty, clears the input field after send */
  async sendMessage() {
    this.fileUrl = await this.checkPictureUpload();

    if (this.threadMessageText.trim() || this.fileUrl) {
      await this.threadMessageService.addThreadMessage(
        this.threadMessageText,
        this.fileUrl
      );
      this.threadMessageText = '';
    }
    this.messageCreated.emit();
    this.uploadService.removeImg('thread-file-upload');
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
    this.threadMessageText += emoji;
    this.closeEmojiSet();
  }

  /**
   * Checks if a given URL is a valid Firebase Storage image URL.
   * @param {string} url - The URL.
   * @returns {boolean} - Returns `true` if the URL is a Firebase Storage image URL, otherwise `false`.
   */
  isImageUrl(url: any): boolean {
    return url.startsWith('https://firebasestorage.googleapis.com/');
  }

  /**
   * opens tagging
   */
  openTagging() {
    const lastChar = this.threadMessageText.slice(-1);

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
      if (
        !this.threadMessageText.includes('@') &&
        !this.threadMessageText.includes('#')
      ) {
        this.isTag = false;
        this.findTag = false;
        this.isAt = false;
        this.isHash = false;
      }
    }
  }
}
