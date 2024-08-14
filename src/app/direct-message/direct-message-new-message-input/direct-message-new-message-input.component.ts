import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { DirectMessageService } from '../../services/direct-message.service';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';

@Component({
  selector: 'app-direct-message-new-message-input',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    FormsModule,
    PickerComponent,
    EmojiComponent
  ],
  templateUrl: './direct-message-new-message-input.component.html',
  styleUrl: './direct-message-new-message-input.component.scss'
})
export class DirectMessageNewMessageInputComponent {
  private directMessageService: DirectMessageService = inject(DirectMessageService);
  messageText: string = '';

  isEmoji: boolean = false;

  async createMessage() {
    if (!this.messageText.trim()) {
      console.warn('The message field is empty. Please type a message!');
    } else {
      await this.directMessageService.newDmMessage(this.messageText);
    }
    this.messageText = '';
  }

  openEmojiSet() {
    this.isEmoji = !this.isEmoji;
  }

  addEmoji(event: any) {
    this.messageText += event.emoji.native;
  }
}
