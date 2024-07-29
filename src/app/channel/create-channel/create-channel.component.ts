import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ChannelService } from '../../services/channel.service';
import { UserService } from '../../services/user.service';


@Component({
  selector: 'app-create-channel',
  standalone: true,
  imports: [MatIconModule, CommonModule, FormsModule],
  templateUrl: './create-channel.component.html',
  styleUrl: './create-channel.component.scss',
})
export class CreateChannelComponent {
  @Output() clickedChannel = new EventEmitter<boolean>();
  channelService: ChannelService = inject(ChannelService);
  userService: UserService = inject(UserService);


  channelName: string = '';
  channelDescription: string = '';


  close() {
    this.clickedChannel.emit(false);
  }
  createChannel() {
    this.channelService.createChannel(
      this.channelName,
      this.channelDescription,
      this.userService.userArray,
    );
    this.close();
  }
}
