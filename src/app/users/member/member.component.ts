import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ChannelService } from '../../services/channel.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChannelMember } from '../../../models/channel.class';
import { ClickOutsideDirective } from '../../directive/click-outside.directive';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-member',
  standalone: true,
  imports: [MatIconModule, FormsModule, CommonModule, ClickOutsideDirective],
  templateUrl: './member.component.html',
  styleUrl: './member.component.scss'
})
export class MemberComponent {
  channelService: ChannelService = inject(ChannelService);
  sharedService: SharedService = inject(SharedService);
  @Output() clickedMembers = new EventEmitter<boolean>();
  @Output() switchToAddMembers = new EventEmitter<boolean>();
  channelMember: ChannelMember[] = [];


  ngOnInit() {
    this.getChannelMember()   
  }

  getChannelMember() {
    this.channelMember = []
    this.channelService.selectedChannel$.forEach((channel) => {
      (channel?.channelMember)?.forEach((member) => {
        this.channelMember.push(member)
      })
    })
  }

  switchToAdd(event: Event){
    event.stopPropagation();
    this.switchToAddMembers.emit(true);
    this.closeWindow()
  }

  closeWindow() {
    this.clickedMembers.emit(false)   
  }

  openProfile(event: Event, member: ChannelMember) {
    event.stopPropagation();
    this.closeWindow();
    this.sharedService.openProfile(member.userId);
    console.log(member);
  }
}
