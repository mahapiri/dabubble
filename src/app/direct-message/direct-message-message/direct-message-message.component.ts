import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-direct-message-message',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './direct-message-message.component.html',
  styleUrl: './direct-message-message.component.scss'
})
export class DirectMessageMessageComponent implements OnInit {
  private chatService: ChatService = inject(ChatService);
  isMyMessage: boolean = false;


  ngOnInit() {
    // this.isMyMessage = this.chatService.setMyMessage(this.channelMessage);
  }

  openThread() {
    // this.clickedAnswer.emit(true);
  }

}
