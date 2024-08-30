import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  inject
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
import { Observable, Subscription } from 'rxjs';
import { ChannelMessageService } from '../../services/channel-message.service';
import { UploadService } from '../../services/upload.service';


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
export class ChannelComponent implements AfterViewChecked {
  @Input() channel!: Channel;
  @Input() channelMessage!: ChannelMessage;
  @Output() clickedThreadChange = new EventEmitter<boolean>();
  @ViewChild('mainChat') mainChat!: ElementRef;
    uploadService: UploadService = inject(UploadService);

  clickedEditChannel: boolean = false;
  clickedAddMembers: boolean = false;
  clickedMembers: boolean = false;
  clickedThread: boolean = false;
  activeChannel: Channel = new Channel({});

  selectedChannel$: Observable<Channel | null> =
    this.channelService.selectedChannel$;
  channelMessages$: Observable<ChannelMessage[]> =
    this.channelMessageService.channelMessages$;

  private subscription: Subscription = new Subscription();

  constructor(
    private channelService: ChannelService,
    private channelMessageService: ChannelMessageService
  ) {
    this.subscription = this.selectedChannel$.subscribe((value) => {
      if (value) {
        this.activeChannel = new Channel(value);
      }
    });
  }

  ngOnInit() {
    //this.scrollToBottom();
  }

  ngAfterViewChecked() {
    //this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.mainChat.nativeElement.scrollTop =
        this.mainChat.nativeElement.scrollHeight;
    } catch (err) {}
  }

  editChannel(event: Event) {
    if (this.clickedMembers || this.clickedAddMembers) {
      this.clickedMembers = false;
      this.clickedAddMembers = false;
    }
    event.stopPropagation();
    this.clickedEditChannel = true;
  }
  closeEditChannel(event: boolean) {
    this.clickedEditChannel = event;
  }

  openMembers(event: Event) {
    if (this.clickedAddMembers || this.clickedEditChannel) {
      this.clickedAddMembers = false;
      this.clickedEditChannel = false;
    }
    event.stopPropagation();
    this.clickedMembers = !this.clickedMembers;
  }

  openAddMembers(event: Event) {
    if (this.clickedMembers || this.clickedEditChannel) {
      this.clickedMembers = false;
      this.clickedEditChannel = false;
    }
    event.stopPropagation();
    this.clickedAddMembers = true;
  }

  closeMembers(event: boolean) {
    this.clickedMembers = event;
  }

  closeAddMembers(event: boolean) {
    this.clickedAddMembers = event;
  }

  switchToAddMembers(event: boolean) {
    this.clickedAddMembers = event;
  }

  handleThreadClick(event: boolean) {
    this.clickedThread = event;
    this.clickedThreadChange.emit(this.clickedThread);
  }

  ngOnDestroy() {
    if (this.channelMessageService.messageListUnsubscribe) {
      this.channelMessageService.messageListUnsubscribe();
    }
    this.subscription.unsubscribe();
  }
}
