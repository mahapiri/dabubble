import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatList, MatListItem } from '@angular/material/list';
import { Subscription } from 'rxjs';
import { User } from '../../../models/user.class';
import { DirectMessageService } from '../../services/direct-message.service';
import { UserService } from '../../services/user.service';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-direct-message-info',
  standalone: true,
  imports: [MatList, MatListItem, CommonModule],
  templateUrl: './direct-message-info.component.html',
  styleUrl: './direct-message-info.component.scss',
})
export class DirectMessageInfoComponent implements OnInit, OnDestroy {
  public userService: UserService = inject(UserService);
  public directMessageService: DirectMessageService =
    inject(DirectMessageService);
  public sharedService: SharedService = inject(SharedService);
  private infoSubscription: Subscription = new Subscription();
  profile: Partial<User> = {};

  /**
   * subscribes the clicke profile for the direct message UI.
   * @memberof DirectMessageInfoComponent
   */
  ngOnInit() {
    this.infoSubscription = this.directMessageService.clickedProfile$.subscribe(
      (profile) => {
        this.profile = {
          username: profile?.username,
          userId: profile?.userId,
          profileImage: profile?.profileImage,
        };
      }
    );
  }

  /**
   * unsubscribes the profile service while it is not anymore in use.
   * @memberof DirectMessageInfoComponent
   */
  ngOnDestroy(): void {
    this.infoSubscription.unsubscribe();
  }

  /**
   * opens the profile popup
   * @param event
   */
  openProfile(event: Event) {
    event.stopPropagation();
    let userId = `${this.profile.userId}`;
    this.sharedService.openProfile(userId);
  }
}
