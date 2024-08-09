import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ReactionService } from '../../services/reaction.service';

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
export class ReactionBarComponent {
  public reactionService: ReactionService = inject(ReactionService);

  showAllReactionBtn() {
    this.reactionService.moreBtn = true;
  }

}
