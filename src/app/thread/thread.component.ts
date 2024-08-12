import { Component, EventEmitter, Output, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { EditChannelComponent } from '../channel/edit-channel/edit-channel.component';
import { CommonModule } from '@angular/common';
import { MemberComponent } from '../users/member/member.component';
import { ChannelService } from '../services/channel.service';
import { Observable } from 'rxjs';
import { ThreadService } from '../services/thread.service';
import { Thread } from '../../models/thread.class';
import { ChannelMessageService } from '../services/channel-message.service';
import { ChannelMessage } from '../../models/channel.class';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    MatInputModule,
    MatListModule,
    EditChannelComponent,
    CommonModule,
    MemberComponent,
  ],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss',
})
export class ThreadComponent {
  @Output() clickedCloseThread = new EventEmitter<boolean>();

  selectedMessage$: Observable<ChannelMessage | null>;
  thread$: Observable<Thread | null>;

  constructor(
    private threadService: ThreadService,
    private channelMessageService: ChannelMessageService
  ) {
    this.selectedMessage$ = this.channelMessageService.selectedChannelMessage$;
    this.thread$ = this.threadService.thread$;
  }

  ngOnInit(): void {
    this.selectedMessage$.subscribe((message) => {
      if (message) {
        console.log('Selected Message:', message);
      }
    });
  }

  closeThread() {
    this.clickedCloseThread.emit(false);
  }
}
