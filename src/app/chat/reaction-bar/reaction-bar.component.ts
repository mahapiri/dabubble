import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ReactionService } from '../../services/reaction.service';
import { ChatService } from '../../services/chat.service';
import { DmMessage } from '../../../models/direct-message.class';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-reaction-bar',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule
  ],
  templateUrl: './reaction-bar.component.html',
  styleUrls: ['./reaction-bar.component.scss']
})
export class ReactionBarComponent implements OnInit, OnDestroy {
  public reactionService: ReactionService = inject(ReactionService);
  public chatService: ChatService = inject(ChatService);
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private reactionSubscription = new Subscription();

  @Input() isMyMessage: boolean = false;
  @Input() message!: DmMessage;
  @Input() isFromReactionContainer: boolean = false;

  reactions$: Observable<any>;

  edit: boolean = false;

  constructor() {
    this.reactions$ = this.reactionService.reactions$;
  }

  ngOnInit() {
    if (this.message && this.message.id) {
      this.reactionService.loadReactionsForMessage(this.message.id);
      this.reactionSubscription = this.reactionService.reactions$.subscribe(() => {
        this.cdr.detectChanges();
      });
    }
    console.log(this.reactions$)
  }

  ngOnDestroy(): void {
    this.reactionSubscription.unsubscribe();
  }

  showAllReactionBtn() {
    this.reactionService.moreBtn = true;
  }

  openThread() {
    this.edit = true;
  }

  openEdit() {}

  get isChannelMessage(): boolean {
    return this.chatService.isChannel;
  }

  
  getReaction(messageID: string, reaction: string) {
    return this.reactionService.isReactionActive(messageID, reaction);
  }


  async setReaction(reaction: string, message: DmMessage) {
    await this.reactionService.setReaction(reaction, message);
    this.cdr.detectChanges();
  }
}
