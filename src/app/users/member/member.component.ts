import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ChannelService } from '../../services/channel.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChannelMember } from '../../../models/channel.class';
import { ClickOutsideDirective } from '../../directive/click-outside.directive';
import { SharedService } from '../../services/shared.service';
import { ChatService } from '../../services/chat.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-member',
  standalone: true,
  imports: [MatIconModule, FormsModule, CommonModule, ClickOutsideDirective],
  templateUrl: './member.component.html',
  styleUrl: './member.component.scss',
})
export class MemberComponent {
  channelService: ChannelService = inject(ChannelService);
  sharedService: SharedService = inject(SharedService);
  chatService: ChatService = inject(ChatService);
  changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);

  @Output() clickedMembers = new EventEmitter<boolean>();
  @Output() switchToAddMembers = new EventEmitter<boolean>();

  subscription: Subscription = new Subscription();
  channelMember: ChannelMember[] = [];
  isEditChannelPopup: boolean = false;

  ngOnInit() {
    this.getChannelMember();

    this.subscription = this.channelService.isEditChannelPopup$.subscribe(
      (value) => {
        this.isEditChannelPopup = value;
        this.changeDetectorRef.detectChanges(); // Manuell aktualisieren
      }
    );
  }

  getChannelMember() {
    this.channelMember = [];
    this.channelService.selectedChannel$.forEach((channel) => {
      channel?.channelMember?.forEach((member) => {
        this.channelMember.push(member);
      });
    });
  }

  switchToAdd(event: Event) {
    event.stopPropagation();
    this.closeWindow();
    this.channelService.clickedAddMembers = true;
    console.log('editChannel Status =', this.isEditChannelPopup); //Test, danach prüfen, ob es die andere Einbindung beeinflusst!

    this.channelService.animationState = 'opening';
    console.log('Current animation state:', this.channelService.animationState);
  }

  closeWindow() {
    if (!this.isEditChannelPopup) {
      this.channelService.closePopup();
    }
  }

  openProfile(event: Event, member: ChannelMember) {
    event.stopPropagation();
    this.closeWindow();
    this.sharedService.openProfile(member.userId);
    console.log(member);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
