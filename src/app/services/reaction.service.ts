import { inject, Injectable } from '@angular/core';
import { DirectMessageService } from './direct-message.service';
import { ChatService } from './chat.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class ReactionService {

  moreBtn: boolean = false;


  constructor() { 

  }

  closeMoreBtn() {
    this.moreBtn = false;
  }
}
