import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
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
    TaggingComponent
  ],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss',
})
export class ThreadComponent implements OnInit, OnDestroy {
  @Output() clickedCloseThread = new EventEmitter<boolean>();
  @Input() thread!: Thread;
  uploadService: UploadService = inject(UploadService);
  public taggingService: TaggingService = inject(TaggingService);
  private taggingSubscription: Subscription = new Subscription();
  uploadPath: string = 'threads';

  threadMessageText: string = '';
  isTag: boolean = false;

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

    this.taggingSubscription = this.taggingService.memberSelectedThread$.subscribe((member) => {
      if (member && member.username) {
        this.addMemberToMessage(member.username);
      }
    });
  }


  /**
  * unsubscribes selected member
  */
  ngOnDestroy(): void {
    this.taggingSubscription.unsubscribe();
  }


  /**
  * add member to message field
  */
  addMemberToMessage(username: string) {
    const mention = `@${username} `;
    if (!this.threadMessageText.includes(mention)) {
      this.threadMessageText += ` ${mention}`;
    }
  }


  /**
   * calls the onFileSelected method and sets the uploadPath to "channel"
   * @param event
   */
  async chooseFile(event: Event) {
    this.uploadService.onFileSelected(event);
    this.uploadService.uploadPath = this.uploadPath;
  }

  /**
   * calls the upload method if a file was chosen and saves the dawnload URL of the file to the threadMessageText
   */
  async checkPictureUpload() {
    if (this.uploadService.fileChosen) {
      await this.uploadService.uploadPicture();
      this.threadMessageText = this.uploadService.downloadURL;
    }
  }

  closeThread() {
    this.clickedCloseThread.emit(false);
    this.chatService.showChannelOnMobile();
  }

  /** Sends the text in the input field to the Thread Collection in the Backend. Trims the message from whitespace, ensures input is not empty, clears the input field after send */
  async sendMessage() {
    await this.checkPictureUpload();
    if (this.threadMessageText.trim()) {
      await this.threadMessageService.addThreadMessage(this.threadMessageText);
      this.threadMessageText = '';
    }
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
  }


  /**
  * close tagging popup
  */
  closePopup() {
    this.isTag = false;
  }
}
