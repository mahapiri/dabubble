import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { Thread, ThreadMessage } from '../../../models/thread.class';
import { ChatService } from '../../services/chat.service';
import { ThreadMessageService } from '../../services/thread-message.service';
import { ReactionContainerComponent } from '../../chat/reaction-container/reaction-container.component';
import { ReactionBarComponent } from '../../chat/reaction-bar/reaction-bar.component';
import { ReactionService } from '../../services/reaction.service';
import { ClickOutsideDirective } from '../../directive/click-outside.directive';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { EmojiPickerComponent } from '../../chat/emoji-picker/emoji-picker.component';

@Component({
  selector: 'app-thread-message',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatInputModule,
    FormsModule,
    ReactionContainerComponent,
    ReactionBarComponent,
    ClickOutsideDirective,
    EmojiComponent,
    EmojiPickerComponent,
  ],
  templateUrl: './thread-message.component.html',
  styleUrl: './thread-message.component.scss',
})
export class ThreadMessageComponent {
  @Input() Thread!: Thread;
  @Input() threadMessage!: ThreadMessage;

  isMyMessage: boolean = false;
  isReactionBtn: boolean = false;
  edit: boolean = false;
  isEmoji: boolean = false;
  notOpen: boolean = true;

  constructor(
    public chatService: ChatService,
    private threadMessageService: ThreadMessageService,
    private reactionService: ReactionService
  ) {}

  /**
   * The `isMyMessage` property is set by checking if the `channelMessage` belongs to the current user.
   */
  ngOnInit() {
    this.isMyMessage = this.chatService.setMyMessage(this.threadMessage);
  }

  /**
   * Checks if a given URL is a valid Firebase Storage image URL.
   * @param {string} url - The URL.
   * @returns {boolean} - Returns `true` if the URL is a Firebase Storage image URL, otherwise `false`.
   */
  isImageUrl(url: string): boolean {
    return url.startsWith('https://firebasestorage.googleapis.com/');
  }

  /**
   * Enables edit mode by setting the `edit` property to `true`.
   */
  openEdit() {
    this.edit = true;
  }

  /**
   * Disables edit mode by setting the `edit` property to `false`.
   */
  closeEdit() {
    this.edit = false;
  }

  /**
   * Saves the current thread message if it contains text, updates the message and closes the edit mode.
   */
  saveMessage() {
    if (this.threadMessage.text.trim()) {
      this.threadMessageService.updateMessage(this.threadMessage);
      this.closeEdit();
    }
  }

  /**
   * sends the message if the message is valid and the Enter key is pressed
   * when Shift+Enter is pressed, a line break is inserted instead
   */
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.saveMessage();
    }
  }

  /**
   * Opens or activates the reaction button by setting the `isReactionBtn` property to `true`.
   */
  openReactionBtn() {
    this.isReactionBtn = true;
  }

  /**
   * Closes or deactivates the "more" reaction button by setting the `moreBtn` property in the reactionService to `false`.
   * Also disables the main reaction button by setting the `isReactionBtn` property to `false`.
   */
  closeReactionMoreBtn() {
    this.reactionService.moreBtn = false;
    this.isReactionBtn = false;
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
    this.threadMessage.text += emoji;
    this.closeEmojiSet();
  }
}
