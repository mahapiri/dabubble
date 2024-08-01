import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { ChannelService } from '../../../services/channel.service';
import { CommonModule } from '@angular/common';
import { ChannelMessage } from '../../../../models/channel.class';

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
}
