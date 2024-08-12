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

  //threadMessages$: Observable<Thread | null>;

  channelService: ChannelService = inject(ChannelService);

  constructor(private threadService: ThreadService) {
    //this.threadMessages$ = this.threadService.selectedMessage$;
  }

  ngOnInit(): void {
    // Hier können Sie die Nachricht, auf die geantwortet wird, anzeigen
    /* this.threadMessages$.subscribe((thread) => {
      if (thread) {
        console.log('Thread loaded:', thread);
        // Zeigen Sie die Antwort-Nachricht und die anderen Nachrichten im Thread an
      }
    }); */
  }

  closeThread() {
    this.clickedCloseThread.emit(false);
  }
}
