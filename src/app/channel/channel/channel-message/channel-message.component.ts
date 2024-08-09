import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { ChannelService } from '../../../services/channel.service';
import { CommonModule } from '@angular/common';
import { Channel, ChannelMessage } from '../../../../models/channel.class';
import { Observable } from 'rxjs';
import { ChatService } from '../../../services/chat.service';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-channel-message',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatInputModule,
    FormsModule,
  ],
  templateUrl: './channel-message.component.html',
  styleUrl: './channel-message.component.scss',
})
export class ChannelMessageComponent {
  @Input() channel!: Channel;
  @Input() channelMessage!: ChannelMessage;
  @Output() clickedAnswer = new EventEmitter<boolean>();

  isMyMessage: boolean = false;
  answered: boolean = true;
  edit: boolean = false;

  channelMessages$: Observable<ChannelMessage[]> =
    this.channelService.channelMessages$;

  constructor(
    private channelService: ChannelService,
    public chatService: ChatService
  ) {}

  ngOnInit() {
    this.isMyMessage = this.chatService.setMyMessage(this.channelMessage);
  }

  openThread() {
    this.clickedAnswer.emit(true);
  }

  openEdit() {
    this.edit = true;
  }

  closeEdit() {
    this.edit = false;
  }

  saveMessage() {
    this.channelService.updateMessage(this.channelMessage);
  }
}
