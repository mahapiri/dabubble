import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardContent } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { DmMessage } from '../../../../models/direct-message.class';

@Component({
  selector: 'app-user-message',
  standalone: true,
  imports: [
    MatCardContent,
    CommonModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
  ],
  templateUrl: './user-message.component.html',
  styleUrl: './user-message.component.scss'
})
export class UserMessageComponent {
  @Input() message!: DmMessage;

  formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  }

  formatDate(date: string): string {
    const todayDate = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };

    const today = todayDate.toLocaleDateString('de-DE', options);

    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toLocaleDateString('de-DE', options);

    if (date === today) {
      return 'Heute';
    }

    if (date === yesterday) {
      return 'Gestern';
    }

    return date;
  }
}
