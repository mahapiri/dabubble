import { Component, inject, Input, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ReactionService } from '../../services/reaction.service';
import { CommonModule } from '@angular/common';
import { DmMessage } from '../../../models/direct-message.class';
import { ReactionBarComponent } from '../reaction-bar/reaction-bar.component';
import { Observable } from 'rxjs';

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
export class ReactionContainerComponent  implements OnInit {
  private reactionService: ReactionService = inject(ReactionService);
  @Input() message!: DmMessage;

  reactions$: Observable<{ [messageID: string]: { [reactionType: string]: number } }>;

  constructor() {
    this.reactions$ = this.reactionService.reactions$;
  }
  
  ngOnInit() {
    // this.reactionService.loadReactionsForMessage(this.message.id);
  }
}

