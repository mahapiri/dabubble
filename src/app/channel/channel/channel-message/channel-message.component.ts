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
import { ThreadMessage } from '../../../../models/thread.class';
import { Observable, Subscription, map, of, throttleTime } from 'rxjs';

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
  ],
  templateUrl: './channel-message.component.html',
  styleUrl: './channel-message.component.scss',
})
export class ChannelMessageComponent {
  @Input() channel!: Channel;
  @Input() channelMessage!: ChannelMessage;
  @Input() channelMessages: ChannelMessage[] = [];
  @Output() clickedAnswer = new EventEmitter<boolean>();

  selectedChannelMessage$!: Observable<ChannelMessage>;
  threadMessages$!: Observable<ThreadMessage[]>;

  threadMessageCount: number = 0;

  private subscription: Subscription = new Subscription();

  //unsubThreadMessages!: () => void;

  isMyMessage: boolean = false;
  edit: boolean = false;

  constructor(
    public chatService: ChatService,
    private channelMessageService: ChannelMessageService,
    private threadService: ThreadService,
    public threadMessageService: ThreadMessageService
  ) {}

  /**
   * The `isMyMessage` property is set by checking if the `channelMessage` belongs to the current user.
   */
  ngOnInit() {
    this.isMyMessage = this.chatService.setMyMessage(this.channelMessage);
    //this.subscription.add(this.threadService.subThreadList());
    //this.threadMessageCount = this.threadMessageService.getThreadMessageCount();
  }

  getThreadMessageCount() {
    let threadMessageCount = 0;
    let threadMessageList = this.threadMessageService.threadMessages;

    threadMessageList.forEach(() => {
      threadMessageCount++;
    });
    return threadMessageCount;
  }

  /* getThreadMessageCount(channelMessage: ChannelMessage): Observable<number> {
    // Suche nach dem Thread, der zu dieser ChannelMessage gehört
    const thread = this.threadService.allThreadsList.find(
      (t: any) => t.replyToMessage.id === channelMessage.id
    );

    if (thread) {
      this.unsubThreadMessages =
        this.threadMessageService.subThreadMessageList();

      return this.threadMessageService.threadMessages$.pipe(
        map((threadMessages) => {
          console.log('Messages Array:', threadMessages);
          console.log('Messages Length:', threadMessages.length);
          return threadMessages.length;
        }),
        throttleTime(50)
      );
    } else {
      // Falls kein Thread existiert, gibt es keine Nachrichten
      return of(0);
    }
  } */

  /**
   * Emits an event to open a Thread to the current message when the user clicks on "answer".
   * Sets the current message as the selected message.
   * Initiates handling of the thread in the `ThreadService`: opens existing thread or creates a new one.
   */
  openThread() {
    this.clickedAnswer.emit(true);
    this.channelMessageService.setSelectedMessage(this.channelMessage);
    this.threadService.handleThread();
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

  isImageUrl(url: string): boolean {
    // Einfache URL-Prüfung, um zu sehen, ob es ein Bild sein könnte
    if (url.startsWith('https://firebasestorage.googleapis.com/')) {
      console.log('img erkannt');

      return true;
    } else {
      console.log('kein img erkannt');

      return false;
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    //this.unsubThreadMessages();
  }
}
