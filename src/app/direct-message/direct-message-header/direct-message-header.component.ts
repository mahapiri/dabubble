import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatCardHeader } from '@angular/material/card';
import { UserService } from '../../services/user.service';
import { User } from '../../../models/user.class';
import { Subscription } from 'rxjs';
import { DirectMessageService } from '../../services/direct-message.service';

@Component({
  selector: 'app-direct-message-header',
  standalone: true,
  imports: [
    MatCardHeader,
    CommonModule
  ],
  templateUrl: './direct-message-header.component.html',
  styleUrl: './direct-message-header.component.scss'
})
export class DirectMessageHeaderComponent implements OnInit, OnDestroy {
  public userService: UserService = inject(UserService);
  private userSubscription: Subscription = new Subscription();
  public directMessageService: DirectMessageService = inject(DirectMessageService);
  profile: Partial<User> = {};


  /**
   * subscribes the clicke profile for the direct message UI
   *
   * @memberof DirectMessageHeaderComponent
   */
  ngOnInit() {
    this.userSubscription = this.directMessageService.clickedProfile$.subscribe((profile) => {
      this.profile = {
        username: profile?.username,
        userId: profile?.userId,
        profileImage: profile?.profileImage,
        state: profile?.state
      };
    });
  }


/**
 * unsubscribes the profile service while it is not anymore in use
 *
 * @memberof DirectMessageHeaderComponent
 */
  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }
}
