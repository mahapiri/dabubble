import { Component, EventEmitter, inject, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ChannelService } from '../../services/channel.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User } from '../../../models/user.class';
import { ChannelMember } from '../../../models/channel.class';

@Component({
  selector: 'app-member',
  standalone: true,
  imports: [MatIconModule, FormsModule, CommonModule],
  templateUrl: './member.component.html',
  styleUrl: './member.component.scss'
})
export class MemberComponent {
  channelService: ChannelService = inject(ChannelService);
  @Output() clickedMembers = new EventEmitter<boolean>();
  channelMember: ChannelMember[] = [];


  ngOnInit() {
    this.getChannelMember()
  }

  getChannelMember() {
    this.channelService.selectedChannel$.forEach((channel) => {
      (channel?.channelMember)?.forEach((member) => {
        this.channelMember.push(member)
      })
    })
  }

  closeWindow() {
    this.clickedMembers.emit(false)   
  }

}
