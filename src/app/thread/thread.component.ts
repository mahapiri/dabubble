import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { EditChannelComponent } from '../channel/edit-channel/edit-channel.component';
import { CommonModule } from '@angular/common';
import { MemberComponent } from '../users/member/member.component';
import { Observable } from 'rxjs';
import { ThreadService } from '../services/thread.service';
import { Thread, ThreadMessage } from '../../models/thread.class';
import { ChatService } from '../services/chat.service';
import { ThreadMessageService } from '../services/thread-message.service';
import { FormsModule } from '@angular/forms';
import { ThreadMessageComponent } from './thread-message/thread-message.component';

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
  ],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss',
})
export class ThreadComponent {
  @Output() clickedCloseThread = new EventEmitter<boolean>();
  @Input() thread!: Thread;

  messageText: string = '';

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

    this.threadMessageService.getAnswerCount();
  }

  closeThread() {
    this.clickedCloseThread.emit(false);
  }

  /** Sends the text in the input field to the Thread Collection in the Backend. Trims the message from whitespace, ensures input is not empty, clears the input field after send */
  async sendMessage() {
    if (this.messageText.trim()) {
      await this.threadMessageService.addThreadMessage(this.messageText);
      this.messageText = '';
    }
  }
}
