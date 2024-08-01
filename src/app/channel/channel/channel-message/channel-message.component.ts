import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { ChannelService } from '../../../services/channel.service';
import { CommonModule } from '@angular/common';
import { ChannelMessage } from '../../../../models/channel.class';
import { formatDate } from '@angular/common';

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
  @Input() channelMessage!: ChannelMessage;
  @Output() clickedAnswer = new EventEmitter<boolean>();

  constructor(private channelService: ChannelService) {}

  openThread() {
    this.clickedAnswer.emit(true);
  }

  formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  }

  formatDateString(dateString: string): string {
    const [day, month, year] = dateString.split('.').map(Number);
    const inputDate = new Date(year, month - 1, day);
    const today = new Date();

    const todayDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    if (inputDate.toDateString() === todayDate.toDateString()) {
      return 'Heute';
    }

    return formatDate(inputDate, 'EEEE, dd.MM.yyyy', 'de');
  }
}
