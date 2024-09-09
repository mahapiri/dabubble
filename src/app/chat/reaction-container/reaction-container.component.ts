import {
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ReactionService } from '../../services/reaction.service';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { DmMessage } from '../../../models/direct-message.class';
import { ReactionBarComponent } from '../reaction-bar/reaction-bar.component';
import { Subscription } from 'rxjs';
import { ChannelMessage } from '../../../models/channel.class';
import { ThreadMessage } from '../../../models/thread.class';

@Component({
  selector: 'app-reaction-container',
  standalone: true,
  imports: [MatIconModule, CommonModule, ReactionBarComponent],
  templateUrl: './reaction-container.component.html',
  styleUrls: ['./reaction-container.component.scss'],
})
export class ReactionContainerComponent implements OnInit, OnDestroy {
  private reactionService: ReactionService = inject(ReactionService);
  private userService: UserService = inject(UserService);
  private reactionSubscription = new Subscription();
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  @Input() message!: DmMessage | ChannelMessage | ThreadMessage;
  @Input() isMyMessage: boolean = false;

  reactions: any;
  userNames: { [userId: string]: string } = {};

  constructor() {}

  ngOnInit() {
    if (this.message && this.message.id) {
      this.reactionService.loadReactionsForMessage(this.message.id);

      this.reactionSubscription = this.reactionService.reactions$.subscribe(
        async (reactions) => {
          this.reactions = reactions[this.message.id];
          await this.loadUserNames();
          this.cdr.detectChanges();
        }
      );
    }
  }

  /**
   * Clean up subscriptions and resources when the component is destroyed.
   */
  ngOnDestroy(): void {
    this.reactionSubscription.unsubscribe();
  }

  /*   private async loadUserNames(): Promise<void> {
    if (this.reactions) {
      for (let reaction of this.reactions) {
        for (let userId of reaction.authorIDs) {
          if (!this.userNames[userId]) {
            try {
              const userName = await this.reactionService.getUsername(userId);
              this.userNames[userId] = userName;
            } catch (error) {
              this.userNames[userId] = 'Unbekannt';
            }
          }
        }
      }
    }
  } */

  /**
   * Loads usernames for all user IDs found in reactions.
   * Iterates through the list of reactions and their users IDs. Calls a helper function to handle the retrieval and storage of usernames.
   * @returns {Promise<void>} A promise that resolves when all usernames have been loaded and processed.
   */
  private async loadUserNames(): Promise<void> {
    if (this.reactions) {
      for (let reaction of this.reactions) {
        for (let userId of reaction.authorIDs) {
          await this.fetchAndStoreUsername(userId);
        }
      }
    }
  }

  /**
   * Retrieves the username for a each user ID and stores it in the `userNames` object.
   * If an error occurs while fetching the username, 'Unbekannt' (unknown) is assigned instead.
   * @param {string} userId - The user ID for which to fetch and store the username.
   * @returns {Promise<void>} A promise that resolves when the username has been fetched and stored.
   */
  private async fetchAndStoreUsername(userId: string): Promise<void> {
    if (!this.userNames[userId]) {
      try {
        const userName = await this.reactionService.getUsername(userId);
        this.userNames[userId] = userName;
      } catch (error) {
        this.userNames[userId] = 'Unbekannt';
      }
    }
  }

  /**
   * Gets and returns the username for a given user ID.
   * @param {string} userId - The ID of the user.
   * @returns {string} The username, 'Du' if it matches the current user ID, or 'Unbekannt' if the username is not found.
   */
  getUserName(userId: string): string {
    const username = this.userNames[userId];
    if (userId === this.userService.userID) {
      return 'Du';
    } else {
      return username || 'Unbekannt';
    }
  }

  /**
   * Checks if the given user ID matches the current user's ID from the `userService`.
   * @param {string} userId - The ID of the user to be checked.
   * @returns {boolean} `true` if the `userId` matches the current user's ID, otherwise `false`.
   */
  isCurrentUser(userId: string): boolean {
    return userId === this.userService.userID;
  }

  /**
   * Processes and returns a sorted array of author IDs. Filters out the current user's ID. If present, moves the current user to the end of the array.
   * @param {string[]} authorIDs - An array of author IDs.
   * @returns {string[]} A sorted array of author IDs with the current user's ID moved to the end if present.
   */
  getSortedAuthors(authorIDs: string[]): string[] {
    const otherAuthors = authorIDs.filter(
      (id) => id !== this.userService.userID
    );
    if (authorIDs.includes(this.userService.userID)) {
      otherAuthors.push(this.userService.userID);
    }
    return otherAuthors;
  }
}
