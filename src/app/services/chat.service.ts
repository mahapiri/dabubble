import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { DmMessage } from '../../models/direct-message.class';
import { ChannelMessage } from '../../models/channel.class';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  previousDate: string | null = null;
  message!: ChannelMessage | DmMessage;
  isChannel: boolean = false;
  isChannelSelectedOnMobile: boolean = false;

  constructor(private userService: UserService) {}

  /**
   * Determines if a message is the first of the day for the dividing line between days in the Chat.
   * If the date is different or if no previous date is set, it marks the message as the first message. `previousDate` is updated to the date of the current message for the next comparison.
   *
   * @param {} currentMessage - The message object to be checked and updated.
   */
  setFirstMessageOfDay(currentMessage: any) {
    if (
      this.previousDate === null ||
      currentMessage.date !== this.previousDate
    ) {
      currentMessage.isFirstMessageOfDay = true;
      this.previousDate = currentMessage.date;
    } else {
      currentMessage.isFirstMessageOfDay = false;
    }
  }

  /**
   * Formats the date into the german date format "weekday, tt.mm.yyyy".
   * Compares the date to the current date, and returns today or tomorrow if that matches.
   *
   * @param {string} date - The date in format 'YYYY-MM-DD'
   * @returns {string} The formatted date string.
   */
  formatDate(date: string): string {
    const [year, month, day] = date.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day); // converts the iso-date string into a date Object

    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };

    const todayDate = new Date();
    const today = new Date(
      todayDate.getFullYear(),
      todayDate.getMonth(),
      todayDate.getDate()
    );

    const yesterdayDate = new Date(todayDate);
    yesterdayDate.setDate(todayDate.getDate() - 1);
    const yesterday = new Date(
      yesterdayDate.getFullYear(),
      yesterdayDate.getMonth(),
      yesterdayDate.getDate()
    );

    const messageDate = new Date(
      dateObj.getFullYear(),
      dateObj.getMonth(),
      dateObj.getDate()
    );

    const formattedDate = dateObj.toLocaleDateString('de-DE', options);

    if (messageDate.getTime() === today.getTime()) {
      return 'Heute';
    } else if (messageDate.getTime() === yesterday.getTime()) {
      return 'Gestern';
    } else {
      return formattedDate;
    }
  }

  /** formats the time to show only hours and minutes in geman 24h format */
  formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  }

  /** returns the true condition for the variable "isMyMessage" by comparing the authorId of the message with the UserId. Further used to change the styling of user and own messages. */
  setMyMessage(message: ChannelMessage | DmMessage): boolean {
    return message.authorId === this.userService.userID;
  }

  /**
   * Sets the isChannel variable to true when a channel is clicked and to false when a direct message profile is clicked.
   * This functionality allows the thread element to be shown or hidden accordingly.
   *
   * @param {boolean} status
   * @memberof ChatService
   */
  setIsChannel(status: boolean) {
    this.isChannel = status;
  }

  /**
   * Updates the header logo (DaBubble or DevSpace) on the window width and clicked channel.
   * This handles the mobile view adjustment.
   *
   * @param {boolean} clickedChannel - Whether a channel was clicked.
   */
  updateHeaderOnMobile(clickedChannel: boolean) {
    if (window.innerWidth > 960) {
      this.isChannelSelectedOnMobile = false;
    } else if (window.innerWidth <= 960 && clickedChannel) {
      this.isChannelSelectedOnMobile = true;
    }
  }

  getIsChannelSelectedOnMobile(): boolean {
    return this.isChannelSelectedOnMobile;
  }
}
