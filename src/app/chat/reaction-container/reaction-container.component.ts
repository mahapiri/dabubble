import { ChangeDetectorRef, Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ReactionService } from '../../services/reaction.service';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { DmMessage } from '../../../models/direct-message.class';
import { ReactionBarComponent } from '../reaction-bar/reaction-bar.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-reaction-container',
  standalone: true,
  imports: [
    MatIconModule,
    CommonModule,
    ReactionBarComponent
  ],
  templateUrl: './reaction-container.component.html',
  styleUrls: ['./reaction-container.component.scss']
})
export class ReactionContainerComponent implements OnInit, OnDestroy {
  private reactionService: ReactionService = inject(ReactionService);
  private userService: UserService = inject(UserService);
  private reactionSubscription = new Subscription();
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  @Input() message!: DmMessage;

  reactions: any;
  userNames: { [userId: string]: Promise<string> } = {};

  constructor() {}

  ngOnInit() {
    if (this.message && this.message.id) {
      this.reactionService.loadReactionsForMessage(this.message.id);

      this.reactionSubscription = this.reactionService.reactions$.subscribe(async (reactions) => {
        this.reactions = reactions[this.message.id];
        await this.loadUserNames();
        this.cdr.detectChanges();
      });
    }
  }

  ngOnDestroy(): void {
    this.reactionSubscription.unsubscribe();
  }


  private async loadUserNames(): Promise<void> {
    if (this.reactions) {
      for (let reaction of this.reactions) {
        for (let userId of reaction.authorIDs) {
          if (!this.userNames[userId]) {
            this.userNames[userId] = this.reactionService.getUsername(userId);
          }
        }
      }
    }
  }

  getUserName(userId: string): Promise<string> {
    return this.userNames[userId] || Promise.resolve('Unknown');
  }
}
