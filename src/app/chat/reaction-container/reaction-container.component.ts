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
  private reactionSubscription = new Subscription();
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  @Input() message!: DmMessage;

  reactions: any;

  constructor() {}

  ngOnInit() {
    if (this.message && this.message.id) {
      this.reactionService.loadReactionsForMessage(this.message.id);

      this.reactionSubscription = this.reactionService.reactions$.subscribe((reactions) => {
        this.reactions = reactions[this.message.id];
        this.cdr.detectChanges();
      });
    }
  }

  ngOnDestroy(): void {
    this.reactionSubscription.unsubscribe();
  }
}
