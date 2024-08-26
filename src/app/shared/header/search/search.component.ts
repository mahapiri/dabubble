import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { SearchService } from '../../../services/search.service';
import { UserService } from '../../../services/user.service';
import { ChatService } from '../../../services/chat.service';
import { DirectMessageService } from '../../../services/direct-message.service';
import { Subscription } from 'rxjs';
import { user } from '@angular/fire/auth';
import { SharedService } from '../../../services/shared.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    MatIconModule,
    CommonModule,
    FormsModule,
    MatDividerModule,
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent implements OnInit, OnDestroy {
  searchService: SearchService = inject(SearchService);
  userService: UserService = inject(UserService);
  chatService: ChatService = inject(ChatService);
  directMessageService: DirectMessageService = inject(DirectMessageService);
  sharedService: SharedService = inject(SharedService);
  currentUserSubscription: Subscription = new Subscription();
  currentUser: any = '';


  constructor() {
  }

  async ngOnInit() {
    //await this.userService.getUserID();
    this.currentUserSubscription = this.userService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  ngOnDestroy(): void {
    this.currentUserSubscription.unsubscribe();
  }

  openChannel() {

  }

  openThread() {

  }


  openDM() {

  }

  openProfile(userID: string) {
    this.sharedService.openProfile(userID);
  }
}
