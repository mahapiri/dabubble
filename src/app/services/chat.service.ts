import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { UserService } from './user.service';
import { DmMessage } from '../../models/direct-message.class';
import { ChannelMessage } from '../../models/channel.class';
import { BehaviorSubject } from 'rxjs';
import { SharedService } from './shared.service';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  previousDate: string | null = null;
  message!: ChannelMessage | DmMessage;
  isChannel: boolean = false;
  clickedBack: boolean = false;
  private renderer: Renderer2;

  private headerLogoSubject = new BehaviorSubject<string>('daBubble');
  headerLogo$ = this.headerLogoSubject.asObservable();

  constructor(
    private userService: UserService,
    private rendererFactory: RendererFactory2,
    private sharedService: SharedService
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  /**
   * Determines if a message is the first of the day for the dividing line between days in the Chat.
   * If the date is different or if no previous date is set, it marks the message as the first message. `previousDate` is updated to the date of the current message for the next comparison.
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

  /**
   * formats the time to show only hours and minutes in geman 24h format
   */
  formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  }

  /**
   * returns the true condition for the variable "isMyMessage" by comparing the authorId of the message with the UserId. Further used to change the styling of user and own messages.
   */
  setMyMessage(message: ChannelMessage | DmMessage): boolean {
    return message.authorId === this.userService.userID;
  }

  /**
   * Sets the isChannel variable to true when a channel is clicked and to false when a direct message profile is clicked.
   * This functionality allows the thread element to be shown or hidden accordingly.
   * @param {boolean} status
   * @memberof ChatService
   */
  setIsChannel(status: boolean) {
    this.isChannel = status;
  }

  /**
   * Sets the value of the `clickedBack` property.
   * @param {boolean} status - The new value to set for the `clickedBack` property.
   */
  setClickedBack(status: boolean) {
    this.clickedBack = status;
  }

  /**
   * Determines if the current screen width is considered mobile.
   * @returns `true` if the screen width is 960 pixels or less, otherwise `false`.
   */
  mobileScreen() {
    return window.innerWidth <= 960;
  }

  /**
   * Updates the header logo (DaBubble or DevSpace) depending on window width and if channel is selected.
   * This handles the mobile view adjustment.
   */
  handleWindowChangeOnMobile() {
    if (this.channelSelectedOnMobile()) {
      this.showHeaderLogo('channelLogo');
      this.showChannel();
    } else if (this.workspaceMenuSelectedOnMobile()) {
      this.showHeaderLogo('daBubble');
      this.showWorkspaceMenu();
    } else {
      this.showHeaderLogo('daBubble');
    }
  }

  /**
   * Checks if a channel is selected on a mobile device (window width 960px or less).
   * @returns {boolean} `true` if the screen width is 960 pixels or less and a channel is selected; otherwise, `false`.
   */
  channelSelectedOnMobile() {
    return window.innerWidth <= 960 && this.isChannel;
  }

  /**
   * Checks if the workspace menu is selected (if channel is NOT selected) on a mobile device (window width 960px or less).
   * @returns {boolean} `true` if the screen width is 960 pixels or less and the workspace menu is selected; otherwise, `false`.
   */
  workspaceMenuSelectedOnMobile() {
    return window.innerWidth <= 960 && !this.isChannel;
  }

  /**
   * Updates the header logo with the specified value.
   * @param value - workspace or DaBubble Logo
   */
  showHeaderLogo(value: string) {
    this.headerLogoSubject.next(value);
  }

  showChannel() {
    if (window.innerWidth <= 960) {
      const workspaceMenu = document.querySelector('#workspaceMenu');
      const channel = document.querySelector('#channel');

      if (workspaceMenu && channel) {
        this.renderer.setStyle(workspaceMenu, 'display', 'none');
        this.renderer.setStyle(channel, 'display', 'flex');
      }
    }
  }

  showWorkspaceMenu() {
    if (window.innerWidth > 960 || this.clickedBack) {
      const workspaceMenu = document.querySelector('#workspaceMenu');
      const channelCard = document.querySelector('#channel');
      const newMessage = document.querySelector('#newMessage');

      if (workspaceMenu && channelCard) {
        this.renderer.setStyle(workspaceMenu, 'display', 'flex');
        this.renderer.setStyle(channelCard, 'display', 'none');
      }

      if (workspaceMenu && newMessage) {
        this.renderer.setStyle(workspaceMenu, 'display', 'flex');
        this.sharedService.setIsNewMessage(false);
      }
    }
  }

  showThreadOnMobile() {
    if (window.innerWidth <= 960) {
      const channel = document.querySelector('#channel');

      this.renderer.setStyle(channel, 'display', 'none');
    }
  }

  showChannelOnMobile() {
    if (window.innerWidth <= 960) {
      const channel = document.querySelector('#channel');

      this.renderer.setStyle(channel, 'display', 'flex');
    }
  }

  showCreateChannelOnMobile() {
    if (window.innerWidth <= 960) {
      const workspaceMenu = document.querySelector('#workspaceMenu');

      this.renderer.setStyle(workspaceMenu, 'display', 'none');
    }
  }
}
