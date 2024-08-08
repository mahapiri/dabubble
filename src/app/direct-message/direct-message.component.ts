import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { DirectMessageService } from '../services/direct-message.service';
import { DirectMessageHeaderComponent } from './direct-message-header/direct-message-header.component';
import { DirectMessageInfoComponent } from './direct-message-info/direct-message-info.component';
import { DirectMessageNewMessageInputComponent } from './direct-message-new-message-input/direct-message-new-message-input.component';
import { DirectMessageMessageComponent } from './direct-message-message/direct-message-message.component';
import { Observable } from 'rxjs';
import { DmMessage } from '../../models/direct-message.class';
@Component({
  selector: 'app-direct-message',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    MatInputModule,
    MatListModule,
    CommonModule,
    DirectMessageHeaderComponent,
    DirectMessageInfoComponent,
    DirectMessageNewMessageInputComponent,
    DirectMessageMessageComponent,
  ],
  templateUrl: './direct-message.component.html',
  styleUrl: './direct-message.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class DirectMessageComponent {
  public directMessageService : DirectMessageService = inject(DirectMessageService);
  messages$: Observable<DmMessage[]>;

  constructor() {
    this.messages$ = this.directMessageService.messages$;
  }
}


