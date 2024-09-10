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
  isDirectMessage: boolean = false;
  isThread: boolean = false;
  isNewMessage: boolean = false;
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
   * Determines if the current screen width is considered mobile.
   * @returns `true` if the screen width is 960 pixels or less, otherwise `false`.
   */
  mobileScreen() {
    return window.innerWidth <= 960;
  }

  /**
   * Handles the mobile view adjustments. Updates the components shown and the header logo (DaBubble or DevSpace) depending on window width.
   */
  handleWindowChangeOnMobile() {
    if (this.channelSelectedOnMobile()) {
      this.updateView('workspaceMenu', 'channel', 'channelLogo');
    } else if (this.directMessageSelectedOnMobile()) {
      this.updateView('workspaceMenu', 'directMessage', 'channelLogo');
    } else if (this.threadSelectedOnMobile()) {
      this.updateView('workspaceMenu', 'thread', 'channelLogo');
    } else if (this.newMessageSelectedOnMobile()) {
      this.updateView('workspaceMenu', 'newMessage', 'channelLogo');
    } else {
      this.showHeaderLogo('daBubble');
    }
  }

  /**
   * Consolidates view switching logic. Shows/hides components and updates the header logo.
   */
  updateView(componentId1: string, componentId2: string, logo: string) {
    this.showHeaderLogo(logo);
    this.hideComponentOnMobile(componentId1);
    this.showComponentOnMobile(componentId2);
  }

  /**
   * Trigger layout update based on the current screen size.
   * If it's mobile, update mobile view, else show desktop view.
   */
  updateLayoutOnResize() {
    if (this.mobileScreen()) {
      this.handleWindowChangeOnMobile();
    } else {
      this.showDesktopLayout();
    }
  }

  /**
   * Handles the desktop layout view, showing the correct logo and workspace Menu.
   */
  showDesktopLayout() {
    this.showWorkspaceMenu();
    this.showHeaderLogo('daBubble');
  }

  /**
   * Checks if a channel is selected on a mobile device (window width 960px or less).
   * @returns {boolean} `true` if the screen width is 960 pixels or less and a channel is selected; otherwise, `false`.
   */
  channelSelectedOnMobile() {
    return this.mobileScreen() && this.isChannel;
  }

  /**
   * Checks if a thread message is selected on mobile device. Calls `setIsThread()` to ensure the `isDirectMessage` variable is correctly set.
   * @returns {boolean} `true` if the screen width is 960 pixels or less and a direct message profile is selected; otherwise, `false`.
   */
  threadSelectedOnMobile() {
    this.setIsThread();
    return this.mobileScreen() && this.isThread;
  }


  newMessageSelectedOnMobile() {
    this.setIsNewMessage();
    return this.mobileScreen() && this.isNewMessage;
  }

  /**
   * Checks if a direct message is selected on mobile device. Calls `setIsDirectMessage()` to ensure the `isDirectMessage` variable is correctly set.
   * @returns {boolean} `true` if the screen width is 960 pixels or less and a direct message profile is selected; otherwise, `false`.
   */
  directMessageSelectedOnMobile() {
    this.setIsDirectMessage();
    return this.mobileScreen() && this.isDirectMessage;
  }

  /**
   * Checks if the workspace menu is selected (if channel and directMessage are NOT selected) on a mobile device (window width 960px or less).
   * @returns {boolean} `true` if the screen width is 960 pixels or less and the workspace menu is selected; otherwise, `false`.
   */
  workspaceMenuSelectedOnMobile() {
    return this.mobileScreen() && !this.isChannel && !this.isDirectMessage;
  }

  /**
   * Updates the header logo with the specified value.
   * @param value - workspace or DaBubble Logo
   */
  showHeaderLogo(value: string) {
    this.headerLogoSubject.next(value);
  }

  /**
   * Hides a component on mobile screens by setting its display style to 'none'.
   * @param {string} componentId - The ID of the component.
   */
  hideComponentOnMobile(componentId: string) {
    if (window.innerWidth <= 960) {
      const component = document.querySelector(`#${componentId}`);
      this.renderer.setStyle(component, 'display', 'none');
    }
  }

  /**
   * Shows a component on mobile screens by setting its display style to 'flex'.
   * @param {string} componentId - The ID of the component.
   */
  showComponentOnMobile(componentId: string) {
    if (window.innerWidth <= 960) {
      const component = document.querySelector(`#${componentId}`);
      this.renderer.setStyle(component, 'display', 'flex');
    }
  }

  /**
   * Displays the workspace menu if the screen width is greater than 960 pixels (desktop view).
   */
  showWorkspaceMenu() {
    if (window.innerWidth > 960 || this.workspaceMenuSelectedOnMobile()) {
      const workspaceMenu = document.querySelector('#workspaceMenu');
      this.renderer.setStyle(workspaceMenu, 'display', 'flex');
    }
    this.hideOtherComponents();
  }

  /** Hides the other components on mobile screen when clicking back to workspace menu */
  hideOtherComponents() {
    if (this.mobileScreen()) {
      const channelCard = document.querySelector('#channel');
      const directMessage = document.querySelector('#directMessage');
      if (channelCard) {
        this.renderer.setStyle(channelCard, 'display', 'none');
      }
      if (directMessage) {
        this.renderer.setStyle(directMessage, 'display', 'none');
      }
    }
  }

  /**
   * Subscribes to the `selectProfileChange$` observable from the `SharedService`. Updates the `isDirectMessage` status.
   */
  setIsDirectMessage() {
    this.sharedService.selectProfileChange$.subscribe((status) => {
      this.isDirectMessage = status;
    });
  }

  /**
   * Subscribes to the `clickedThread$` observable from the `SharedService`. Updates the `isThread` status.
   */
  setIsThread() {
    this.sharedService.clickedThread$.subscribe((status) => {
      this.isThread = status;
    })
  }

  setIsNewMessage() {
    this.sharedService.isNewMessage$.subscribe((status) => {
      this.isNewMessage = status;
    })
  }
}
