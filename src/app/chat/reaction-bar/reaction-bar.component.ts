import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  Input,
  OnDestroy,
  OnInit,
  ChangeDetectorRef,
  Output,
  EventEmitter,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ReactionService } from '../../services/reaction.service';
import { ChatService } from '../../services/chat.service';
import { DmMessage } from '../../../models/direct-message.class';
import { Observable, Subscription } from 'rxjs';
import { ChannelMessageService } from '../../services/channel-message.service';
import { ThreadService } from '../../services/thread.service';
import { ThreadMessageService } from '../../services/thread-message.service';
import { ChannelMessage } from '../../../models/channel.class';
import { ThreadMessage } from '../../../models/thread.class';

@Component({
  selector: 'app-reaction-bar',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './reaction-bar.component.html',
  styleUrls: ['./reaction-bar.component.scss'],
})
export class ReactionBarComponent implements OnInit, OnDestroy {
  public reactionService: ReactionService = inject(ReactionService);
  public chatService: ChatService = inject(ChatService);
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private reactionSubscription = new Subscription();

  @Input() isMyMessage: boolean = false;
  @Input() message!: DmMessage | ChannelMessage | ThreadMessage;
  @Input() isFromReactionContainer: boolean = false;
  @Output() editSelected: EventEmitter<void> = new EventEmitter<void>();
  @Output() clickedAnswer = new EventEmitter<boolean>();
  @Output() clickedThreadChange = new EventEmitter<boolean>();

  selectedChannelMessage$!: Observable<ChannelMessage>;

  reactions$: Observable<any>;
  clickedThread: boolean = false;
  edit: boolean = false;

  constructor(
    private channelMessageService: ChannelMessageService,
    private threadService: ThreadService,
    public threadMessageService: ThreadMessageService
  ) {
    this.reactions$ = this.reactionService.reactions$;
  }

  ngOnInit() {
    if (this.message && this.message.id) {
      this.reactionService.loadReactionsForMessage(this.message.id);
      this.reactionSubscription = this.reactionService.reactions$.subscribe(
        (reaction) => {
          this.reactions$ = reaction;
          this.cdr.detectChanges();
        }
      );
    }
  }

  ngOnDestroy(): void {
    this.reactionSubscription.unsubscribe();
  }

  showAllReactionBtn() {
    this.reactionService.moreBtn = true;
  }

  /**
   * Emits an event to open a Thread to the current message when the user clicks on "answer".
   * Sets the current message as the selected message.
   * Initiates handling of the thread in the `ThreadService`: opens existing thread or creates a new one.
   */
  openThread() {
    this.clickedAnswer.emit(true);
    this.channelMessageService.setSelectedMessage(this.message);
    this.threadService.handleThread();
  }

  handleThreadClick(event: boolean) {
    this.clickedThread = event;
    this.clickedThreadChange.emit(this.clickedThread);
  }

  openEdit() {
    this.editSelected.emit();
  }

  get isChannelMessage(): boolean {
    return this.chatService.isChannel;
  }

  getReaction(messageID: string, reaction: string) {
    return this.reactionService.isReactionActive(messageID, reaction);
  }

  async setReaction(reaction: string, message: DmMessage) {
    await this.reactionService.setReaction(reaction, message);
    this.cdr.detectChanges();
  }
}
