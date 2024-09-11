import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ClickOutsideDirective } from '../../directive/click-outside.directive';
import { NewMessageService } from '../../services/new-message.service';
import { User } from '../../../models/user.class';
import { ChannelService } from '../../services/channel.service';
import { TaggingService } from '../../services/tagging.service';


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
  public taggingService: TaggingService = inject(TaggingService);
  private channelService: ChannelService = inject(ChannelService);


  inputActive: boolean = false;
  usersearch: boolean = false;
  channelsearch: boolean = false;

  searchword: string = '';

  channels: any = [];
  users: User[] = [];
  currentUserId: string = '';

  
  /**
   * Initializes the component, loading channels and users from the NewMessageService.
   * Sets the current user's ID.
   */
  ngOnInit(): void {
    this.channels = this.newMessageService.channelList;
    this.users = this.newMessageService.userList;
    this.currentUserId = this.newMessageService.currentUserId;
  }


  /**
   * Opens search results based on the search word.
   * 
   * This method checks if the search word starts with "@" for users or "#" for channels,
   * and updates the search word accordingly. It also activates the search input if the word is non-empty.
   */
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


  /**
   * Closes the search results and deactivates the input field.
   */
  closeResults() {
    this.inputActive = false;
  }


  /**
   * Selects a channel from the search results.
   */
  selectChannel(event: Event, channel: any) {
    event.stopPropagation();
    event.preventDefault();
    this.newMessageService.selectChannel(channel);
    this.taggingService.setSelectedChannel(channel);
    this.searchword = channel.name;
    this.closeResults();
  }


  /**
   * Selects a user from the search results.
   */
  selectUser(event: Event, user: User) {
    event.stopPropagation();
    event.preventDefault();
    this.newMessageService.selectUser(user)
    this.searchword = user.username;
    this.closeResults();
  } 
}
