import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardContent } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { OwnMessageComponent } from './own-message/own-message.component';
import { UserMessageComponent } from './user-message/user-message.component';

@Component({
  selector: 'app-dm-message',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatCardContent,
    OwnMessageComponent,
    UserMessageComponent
  ],
  templateUrl: './dm-message.component.html',
  styleUrl: './dm-message.component.scss'
})
export class DmMessageComponent {

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
