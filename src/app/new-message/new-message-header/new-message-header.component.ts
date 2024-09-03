import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ClickOutsideDirective } from '../../directive/click-outside.directive';
import { NewMessageService } from '../../services/new-message.service';
import { User } from '../../../models/user.class';


@Component({
  selector: 'app-new-message-header',
  standalone: true,
  imports: [
    MatCardModule,
    CommonModule,
    MatIconModule,
    FormsModule,
    ClickOutsideDirective
  ],
  templateUrl: './new-message-header.component.html',
  styleUrl: './new-message-header.component.scss'
})
export class NewMessageHeaderComponent implements OnInit {
  public newMessageService: NewMessageService = inject(NewMessageService);


  inputActive: boolean = false;
  usersearch: boolean = false;
  channelsearch: boolean = false;

  searchword: string = '';

  channels: any = [];
  users: User[] = [];
  currentUserId: string = '';


  ngOnInit(): void {
    this.channels = this.newMessageService.channelList;
    this.users = this.newMessageService.userList;
    this.currentUserId = this.newMessageService.currentUserId;
  }


  openResults() {
    this.inputActive = this.searchword.trim().length > 0;
    this.usersearch = this.searchword.startsWith('@');
    this.channelsearch = this.searchword.startsWith('#');

    let searchwordToSet = this.searchword;

    if(this.usersearch || this.channelsearch) {
      if (this.searchword.trim().length > 1) {
        searchwordToSet = this.searchword.substring(1);
    }
    }

    this.newMessageService.setSearchword(searchwordToSet);
  }

  closeResults() {
    this.inputActive = false;
  }



  selectChannel(channel: any) {
    this.newMessageService.selectChannel(channel);
    this.searchword = channel.name;


  }

  selectUser(user: User) {
    this.newMessageService.selectUser(user)
    this.searchword = user.username;
  } 
}
