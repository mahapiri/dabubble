import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ReactionService } from '../../services/reaction.service';
import { ChatService } from '../../services/chat.service';
import { DmMessage } from '../../../models/direct-message.class';

@Component({
  selector: 'app-reaction-bar',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule
  ],
  templateUrl: './reaction-bar.component.html',
  styleUrl: './reaction-bar.component.scss'
})
export class ReactionBarComponent implements OnInit, OnDestroy {
  public reactionService: ReactionService = inject(ReactionService);
  public chatService: ChatService = inject(ChatService);

  @Input() isMyMessage: boolean = false;
  @Input() message!: DmMessage;

  edit: boolean = false;


  constructor() {
  }


  ngOnInit() {
  }


  ngOnDestroy(): void { }


  showAllReactionBtn() {
    this.reactionService.moreBtn = true;
  }


  openThread() {
    this.edit = true;
  }


  openEdit() { }

  
  get isChannelMessage(): boolean {
    return this.chatService.isChannel;
  }

}
