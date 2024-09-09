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
  @Input() isFromThread: boolean = false;
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

  /**
   * Cleans up the subscriptions when component is destroyed.
   */
  ngOnDestroy(): void {
    this.reactionSubscription.unsubscribe();
  }

  /**
   * Displays the "Show All Reactions" button.
   * This method sets the `moreBtn` property of the `reactionService` to `true`, so that the "Show All Reactions" button is visible.
   */
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

  /**
   * Handles the click event for a thread. Sets the state based on the passed event and emits the updated value.
   * @param {boolean} event - The value of the click event state.
   */
  handleThreadClick(event: boolean) {
    this.clickedThread = event;
    this.clickedThreadChange.emit(this.clickedThread);
  }

  /**
   * Emits an event to trigger the edit mode.
   * This method emits the `editSelected` event to signal that the edit action has been triggered.
   */
  openEdit() {
    this.editSelected.emit();
  }

  /**
   * Determines if the current chat is a channel message.
   * @returns {boolean} `true` if its a channel message, otherwise `false`.
   */
  get isChannelMessage(): boolean {
    return this.chatService.isChannel;
  }

  /**
   * Checks if a specific reaction is active for a given message.
   * @param {string} messageID - The ID of the message.
   * @param {string} reaction - The reaction to check (e.g., 'like', 'love', etc.).
   * @returns {boolean} Returns `true` if the reaction is active for the message, otherwise `false`.
   */
  getReaction(messageID: string, reaction: string) {
    return this.reactionService.isReactionActive(messageID, reaction);
  }

  /**
   * Sets a reaction for a given message and triggers change detection to update the view.
   * @param {string} reaction - The reaction to set (e.g., 'like', 'love', etc.).
   * @param {DmMessage} message - The message to which the reaction is to be applied.
   * @returns {Promise<void>} A promise that resolves when the reaction is set and change detection is complete.
   */
  async setReaction(reaction: string, message: DmMessage) {
    await this.reactionService.setReaction(reaction, message);
    this.cdr.detectChanges();
  }
}
