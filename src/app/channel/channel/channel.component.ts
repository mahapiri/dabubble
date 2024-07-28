import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  inject,
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
import { ChannelService } from '../../services/channel.service';
import { ThreadComponent } from '../../thread/thread.component';

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
  ],
  templateUrl: './channel.component.html',
  styleUrl: './channel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChannelComponent {
  clickedEditChannel: boolean = false;
  clickedAddMembers: boolean = false;
  clickedMembers: boolean = false;

  channelService: ChannelService = inject(ChannelService);

  @Output() clickedAnswer = new EventEmitter<boolean>();

  editChannel() {
    this.clickedEditChannel = true;
  }

  showMembers() {
    this.clickedMembers = true;
  }

  openThread() {
    this.clickedAnswer.emit(true);
  }

  addMembers() {
    this.clickedAddMembers = true;
  }

  sendMessage() {
    this.channelService.addMessageInChannel();
  }
}
