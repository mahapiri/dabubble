import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { ChatService } from '../../services/chat.service';
import { DmMessage } from '../../../models/direct-message.class';
import { UserService } from '../../services/user.service';
import { ReactionContainerComponent } from '../../chat/reaction-container/reaction-container.component';
import { ReactionBarComponent } from '../../chat/reaction-bar/reaction-bar.component';
import { ReactionService } from '../../services/reaction.service';
import { Subscription } from 'rxjs';

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
    ReactionBarComponent
  ],
  templateUrl: './direct-message-message.component.html',
  styleUrl: './direct-message-message.component.scss'
})
export class DirectMessageMessageComponent implements OnInit {
  public chatService: ChatService = inject(ChatService);
  public reactionService: ReactionService = inject(ReactionService);


  @Input() message!: DmMessage;
  isMyMessage: boolean = false;


  constructor() { }


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
