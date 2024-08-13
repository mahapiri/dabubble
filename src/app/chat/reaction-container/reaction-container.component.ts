import { ChangeDetectorRef, Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ReactionService } from '../../services/reaction.service';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { DmMessage } from '../../../models/direct-message.class';
import { ReactionBarComponent } from '../reaction-bar/reaction-bar.component';
import { Subscription } from 'rxjs';
import { user } from '@angular/fire/auth';

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
  userNames: { [userId: string]: string } = {}; 

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
            try {
              const userName = await this.reactionService.getUsername(userId);
              this.userNames[userId] = userName;
            } catch (error) {
              this.userNames[userId] = 'Unbekannt';
            }
          }
        }
      }
    }
  }


  getUserName(userId: string): string {
    const username = this.userNames[userId];
    if(userId === this.userService.userID) {
      return 'Du';
    } else {
      return username || 'Unbekannt';
    }
  }


  isCurrentUser(userId: string): boolean {
    return userId === this.userService.userID;
  }
  

  getSortedAuthors(authorIDs: string[]): string[] {
    const otherAuthors = authorIDs.filter(id => id !== this.userService.userID);
    if (authorIDs.includes(this.userService.userID)) {
      otherAuthors.push(this.userService.userID);
    }
    return otherAuthors;
  }
}
