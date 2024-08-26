import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { SharedService } from '../../services/shared.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ClickOutsideDirective } from '../../directive/click-outside.directive';
import { DirectMessageService } from '../../services/direct-message.service';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    MatIconModule,
    CommonModule,
    ClickOutsideDirective
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit, OnDestroy {
  private sharedService: SharedService = inject(SharedService);
  private directMessage: DirectMessageService = inject(DirectMessageService);
  private chatService: ChatService = inject(ChatService);
  private profileSubscription = new Subscription();

  user: any = null;


  ngOnInit() {
    this.profileSubscription = this.sharedService.profile$.subscribe((profile) => {
      if (profile) {
        this.user = profile;
      }
    });
  }


  ngOnDestroy(): void {
    this.profileSubscription.unsubscribe();
  }


  close() {
    this.sharedService.isProfile = false;
  }


  openDM() {

  }
}
