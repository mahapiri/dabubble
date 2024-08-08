import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { ChatService } from '../../services/chat.service';
import { DmMessage } from '../../../models/direct-message.class';
import { UserService } from '../../services/user.service';

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
  public chatService: ChatService = inject(ChatService);
  public userService: UserService = inject(UserService);
  @Input() message!: DmMessage;

  isMyMessage: boolean = false;

  constructor() {}


  ngOnInit() {
    this.isMyMessage = this.chatService.setMyMessage(this.message);
  }

}
