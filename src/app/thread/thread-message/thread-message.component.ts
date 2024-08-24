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
import { ThreadService } from '../../services/thread.service';

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
  ],
  templateUrl: './thread-message.component.html',
  styleUrl: './thread-message.component.scss',
})
export class ThreadMessageComponent {
  @Input() Thread!: Thread;
  @Input() threadMessage!: ThreadMessage;

  isMyMessage: boolean = false;
  edit: boolean = false;

  constructor(
    public chatService: ChatService,
    private theadMessageService: ThreadMessageService,
    private threadService: ThreadService
  ) {}

  /**
   * The `isMyMessage` property is set by checking if the `channelMessage` belongs to the current user.
   */
  ngOnInit() {
    this.isMyMessage = this.chatService.setMyMessage(this.threadMessage);
  }

  isImageUrl(url: string): boolean {
    return url.startsWith('https://firebasestorage.googleapis.com/');
  }

  openEdit() {}

  closeEdit() {}

  saveMessage() {}
}
