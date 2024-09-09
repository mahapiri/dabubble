import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { Channel, ChannelMessage } from '../../../../models/channel.class';
import { ChatService } from '../../../services/chat.service';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { ChannelMessageService } from '../../../services/channel-message.service';
import { ThreadService } from '../../../services/thread.service';
import { ThreadMessageService } from '../../../services/thread-message.service';
import { Observable, Subscription } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { ReactionBarComponent } from '../../../chat/reaction-bar/reaction-bar.component';
import { ReactionContainerComponent } from '../../../chat/reaction-container/reaction-container.component';
import { ReactionService } from '../../../services/reaction.service';

@Component({
  selector: 'app-channel-message',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatInputModule,
    FormsModule,
    ReactionBarComponent,
    ReactionContainerComponent,
  ],
  templateUrl: './channel-message.component.html',
  styleUrl: './channel-message.component.scss',
})
export class ChannelMessageComponent {
  @Input() channel!: Channel;
  @Input() channelMessage!: ChannelMessage;
  @Output() clickedAnswer = new EventEmitter<boolean>();

  selectedChannelMessage$!: Observable<ChannelMessage>;

  public answerCount: number = 0;
  public lastAnswerTime: string = '';
  private answerCountSubscription!: Subscription;
  private lastAnswerSubscription!: Subscription;

  isMyMessage: boolean = false;
  edit: boolean = false;

  constructor(
    public chatService: ChatService,
    private channelMessageService: ChannelMessageService,
    private threadService: ThreadService,
    public threadMessageService: ThreadMessageService,
    private cdRef: ChangeDetectorRef,
    private reactionService: ReactionService
  ) {}

  /**
   * The `isMyMessage` property is set by checking if the `channelMessage` belongs to the current user.
   */
  ngOnInit() {
    this.isMyMessage = this.chatService.setMyMessage(this.channelMessage);

    this.answerCountSubscription = this.threadMessageService
      .getAnswerCountForChannelMessage(this.channelMessage.id)
      .subscribe((count) => {
        this.answerCount = count;
        this.cdRef.detectChanges();
      });

    this.lastAnswerSubscription = this.threadMessageService
      .getLastAnswer(this.channelMessage.id)
      .subscribe((time) => {
        this.lastAnswerTime = time;
        this.cdRef.detectChanges();
      });
  }

  /**
   * Emits an event to open a Thread to the current message when the user clicks on "answer".
   * Sets the current message as the selected message.
   * Initiates handling of the thread in the `ThreadService`: opens existing thread or creates a new one.
   */
  openThread() {
    this.clickedAnswer.emit(true);
    this.channelMessageService.setSelectedMessage(this.channelMessage);
    this.threadService.handleThread();
    this.cdRef.detectChanges();
    this.chatService.showThreadOnMobile();
  }

  /**
   * Sets edit property to true to enable edit mode
   */
  openEdit() {
    this.edit = true;
  }

  /**
   * Sets edit property to false to exit edit mode
   */
  closeEdit() {
    this.edit = false;
  }

  /**
   * Calls two methods: to update the message in the firestore in the channel collection and in the thread collection in the message belonging to the thread.
   * Exits edit mode.
   */
  saveMessage() {
    this.channelMessageService.updateMessage(this.channelMessage);
    this.threadService.updateReplyToMesageInThreadObject(this.channelMessage);
    this.closeEdit();
  }

  /**
   * Checks if a given URL is an image URL from Firebase Storage.
   * @param {string} url - The URL
   * @returns {boolean} Returns `true` if the URL starts with 'https://firebasestorage.googleapis.com/', otherwise `false`.
   */
  isImageUrl(url: string): boolean {
    return url.startsWith('https://firebasestorage.googleapis.com/');
  }

  /**
   * Clean up subscriptions when the component is destroyed.
   */
  ngOnDestroy() {
    this.answerCountSubscription.unsubscribe();
    this.lastAnswerSubscription.unsubscribe();
  }

  /**
   * close the Smiley Emoticons for More Reactions
   */
  closeReactionMoreBtn() {
    this.reactionService.moreBtn = false;
  }
}
