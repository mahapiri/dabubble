import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { ChannelService } from '../../../services/channel.service';
import { CommonModule } from '@angular/common';
import { Channel, ChannelMessage } from '../../../../models/channel.class';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-channel-message',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
  ],
  templateUrl: './channel-message.component.html',
  styleUrl: './channel-message.component.scss',
})
export class ChannelMessageComponent {
  @Input() channel!: Channel;
  @Input() channelMessage!: ChannelMessage;
  @Output() clickedAnswer = new EventEmitter<boolean>();

  channelMessages$: Observable<ChannelMessage[]> =
    this.channelService.channelMessages$;

  constructor(private channelService: ChannelService) {}

  openThread() {
    this.clickedAnswer.emit(true);
  }

  formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  }

  /**
   * Formats the date from the message into the german date format "weekday, day.month.year" for display.
   * If the date corresponds to today, it returns 'Heute'. If the date corresponds to yesterday, it returns 'Gestern'. Otherwise, it returns the date in the format: Wochentag, tt.mm.jjj.
   *
   * @param {string} date - The date string to format. ISO 8601 format (e.g., 'YYYY-MM-DD').
   * @returns {string} The formatted date string.
   */
  formatDate(date: string): string {
    const dateObj = new Date(date); // converts the date string into a date Object

    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };

    const formattedDate = dateObj.toLocaleDateString('de-DE', options);

    const todayDate = new Date();
    const today = todayDate.toString();

    const yesterdayDate = new Date().setDate(todayDate.getDate() - 1);
    const yesterday = yesterdayDate.toString();

    const messageDate = dateObj.toString();

    if (messageDate === today) {
      return 'Heute';
    } else if (messageDate === yesterday) {
      return 'Gestern';
    } else {
      return formattedDate;
    }
  }
}
