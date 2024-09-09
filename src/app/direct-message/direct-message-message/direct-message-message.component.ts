import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  OnInit,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { ChatService } from '../../services/chat.service';
import { DmMessage } from '../../../models/direct-message.class';
import { ReactionContainerComponent } from '../../chat/reaction-container/reaction-container.component';
import { ReactionBarComponent } from '../../chat/reaction-bar/reaction-bar.component';
import { ReactionService } from '../../services/reaction.service';
import { EmojiPickerComponent } from '../../chat/emoji-picker/emoji-picker.component';
import { ClickOutsideDirective } from '../../directive/click-outside.directive';
import { FormsModule } from '@angular/forms';
import { DirectMessageService } from '../../services/direct-message.service';
import { deleteDoc, doc } from '@firebase/firestore';
import { setDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-direct-message-message',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    ReactionContainerComponent,
    ReactionBarComponent,
    EmojiPickerComponent,
    ClickOutsideDirective,
    FormsModule,
  ],
  templateUrl: './direct-message-message.component.html',
  styleUrl: './direct-message-message.component.scss',
})
export class DirectMessageMessageComponent implements OnInit {
  public chatService: ChatService = inject(ChatService);
  public reactionService: ReactionService = inject(ReactionService);
  public directMessageService: DirectMessageService =
    inject(DirectMessageService);
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  @Input() message!: DmMessage;
  isMyMessage: boolean = false;

  edit: boolean = false;
  isEmoji: boolean = false;
  notOpen: boolean = true;
  messageText: string = '';

  constructor() {}

  /**
   * open edit layout
   */
  openEdit() {
    this.messageText = this.message.text;
    this.edit = true;
  }

  /**
   * close edit layout
   */
  closeEdit() {
    this.edit = false;
  }

  /**
   * save/delete new edited message
   */
  async saveMessage() {
    const messageId = this.message.id;
    const messageRef = doc(
      this.directMessageService.getMessagesRef(),
      messageId
    );

    if (this.messageText.trim().length === 0) {
      await deleteDoc(messageRef);
    } else {
      await setDoc(messageRef, { text: this.messageText }, { merge: true });
    }

    this.edit = false;
    this.cdr.detectChanges();
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
   * checks all available messages to get the right container style for your message or from another profile
   */
  ngOnInit() {
    this.isMyMessage = this.chatService.setMyMessage(this.message);
  }

  /**
   * close the Smiley Emoticons for More Reactions
   */
  closeReactionMoreBtn() {
    this.reactionService.moreBtn = false;
  }
}
