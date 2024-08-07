import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatCardHeader } from '@angular/material/card';
import { UserService } from '../../services/user.service';
import { User } from '../../../models/user.class';
import { Subscription } from 'rxjs';

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
  profile: Partial<User> = {};


  /**
   * subscribes the current user to get data for the direct message header component
   *
   * @memberof DirectMessageHeaderComponent
   */
  ngOnInit() {
    this.userSubscription = this.userService.currentUser$.subscribe((user) => {
      this.profile = {
        username: user?.username,
        profileImage: user?.profileImage,
        state: user?.state,
        userId: user?.userId
      };
    });
  }


/**
 * unsubscribes the current user subsricption
 *
 * @memberof DirectMessageHeaderComponent
 */
  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }
}
