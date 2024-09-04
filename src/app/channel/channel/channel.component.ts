import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
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
export class ChannelComponent implements OnInit {
  @Input() channel!: Channel;
  @Input() channelMessage!: ChannelMessage;
  @Output() clickedThreadChange = new EventEmitter<boolean>();
  @ViewChild('messageContainer') private messageContainer!: ElementRef;

  uploadService: UploadService = inject(UploadService);

  clickedThread: boolean = false;
  activeChannel: Channel = new Channel({});

  selectedChannel$: Observable<Channel | null> =
    this.channelService.selectedChannel$;
  channelMessages$: Observable<ChannelMessage[]> =
    this.channelMessageService.channelMessages$;

  private subscription: Subscription = new Subscription();

  constructor(
    public channelService: ChannelService,
    private channelMessageService: ChannelMessageService
  ) {
    this.subscription = this.selectedChannel$.subscribe((value) => {
      if (value) {
        this.activeChannel = new Channel(value);
      }
    });
  }

  ngOnInit(): void {
    this.scrollToBottom();
  }

  /**
   * scroll to latest message
   */
  scrollToBottom(): void {
    setTimeout(() => {
      const container = this.messageContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    }, 500);
  }

  /**
   * Triggered when a new message is created to the bottom
   */
  onMessageCreated() {
    this.scrollToBottom();
  }

  /**
   * opens the edit-channel popup
   */
  editChannel(event: Event) {
    this.channelService.closePopup()
    event.stopPropagation();
    this.channelService.clickedEditChannel = true;
  }

    /**
   * opens the members popup
   */
  openMembers(event: Event) {
    this.channelService.closePopup()
    event.stopPropagation();
    this.channelService.clickedMembers = !this.channelService.clickedMembers;
  }
  /**
   * opens the add-members popup
   */
  openAddMembers(event: Event) {
    this.channelService.closePopup()
    event.stopPropagation();
    this.channelService.clickedAddMembers = true;
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
