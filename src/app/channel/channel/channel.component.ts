import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { EditChannelComponent } from '../edit-channel/edit-channel.component';
import { CommonModule } from '@angular/common';
import { MemberComponent } from '../../users/member/member.component';
import { AddMemberComponent } from '../../users/add-member/add-member.component';
import { ThreadComponent } from '../../thread/thread.component';
import { ChannelNewMessageInputComponent } from './channel-new-message-input/channel-new-message-input.component';
import { ChannelMessageComponent } from './channel-message/channel-message.component';
import { Channel, ChannelMessage } from '../../../models/channel.class';
import { ChannelService } from '../../services/channel.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatInputModule,
    MatListModule,
    EditChannelComponent,
    CommonModule,
    MemberComponent,
    AddMemberComponent,
    ThreadComponent,
    ChannelNewMessageInputComponent,
    ChannelMessageComponent,
  ],
  templateUrl: './channel.component.html',
  styleUrl: './channel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChannelComponent {
  @Input() channel!: Channel;
  @Output() clickedThreadChange = new EventEmitter<boolean>();
  //channelMessages: ChannelMessage[] = [];

  clickedEditChannel: boolean = false;
  clickedAddMembers: boolean = false;
  clickedMembers: boolean = false;
  clickedThread: boolean = false;

  selectedChannel$: Observable<Channel | null> =
    this.channelService.selectedChannel$;
  channelMessages$: Observable<ChannelMessage[]> =
    this.channelService.channelMessages$;

  constructor(private channelService: ChannelService) {}

  /* getMessageList(): ChannelMessage[] {
    return this.channelService.channelMessages;
  } */

  editChannel() {
    this.clickedEditChannel = true;
  }

  showMembers() {
    this.clickedMembers = true;
  }

  addMembers() {
    this.clickedAddMembers = true;
  }

  handleThreadClick(event: boolean) {
    this.clickedThread = event;
    this.clickedThreadChange.emit(this.clickedThread);
  }
}
