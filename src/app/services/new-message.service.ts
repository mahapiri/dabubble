import { inject, Injectable, OnDestroy, OnInit } from '@angular/core';
import { UserService } from './user.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { User } from '../../models/user.class';
import { doc, Firestore, getDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class NewMessageService implements OnDestroy {
  private firestore: Firestore = inject(Firestore);
  private userService: UserService = inject(UserService);
  private userServiceSubscription: Subscription = new Subscription();

  private searchwordSubject = new BehaviorSubject<string>('');
  searchword$ = this.searchwordSubject.asObservable();

  private messageIdSubject = new BehaviorSubject<string>('');
  messageId$ = this.messageIdSubject.asObservable();

  isChannel: boolean = false;

  userList: User[] = [];
  channelList: any = [];
  currentUserId: string = '';
  resultUser: User[] = [];
  resultChannel: any = [];

  constructor() {
    const currentUserSubscription = this.userService.currentUser$.subscribe(
      (user) => {
        this.currentUserId = user?.userId || '';
      }
    );

    const userListSubscription = this.userService._userList.subscribe(
      (userList) => {
        this.userList = userList;

        const currentUser = this.userList.find(
          (profile) => this.currentUserId === profile.userId
        );

        if (currentUser) {
          currentUser.userChannels.forEach(async (id: any) => {
            const channelName = await this.proofChannelName(id);
            this.channelList.push({
              name: channelName,
              id: id,
            });
          });
        }
      }
    );

    this.userServiceSubscription.add(currentUserSubscription);
    this.userServiceSubscription.add(userListSubscription);
  }


  /**
   * Unsubscribes from the user service when the component is destroyed.
   */
  ngOnDestroy(): void {
    this.userServiceSubscription.unsubscribe();
    // console.log('unsub new msg service');
  }


  /**
   * Sets the search keyword and updates the result lists (users and channels) based on the search term.
   * @param searchword The keyword to search for users and channels.
   * @returns 
   */
  setSearchword(searchword: string) {
    this.searchwordSubject.next(searchword);

    this.resultUser = [];
    this.resultChannel = [];

    if (!searchword || searchword.trim() === '') {
      return;
    }

    const searchValue = searchword.trim().toLowerCase();

    if (searchValue === '@' || searchValue === '#') {
      this.resultUser = [...this.userList];
      this.resultChannel = [...this.channelList];
      return;
    }

    this.searchUser(searchValue);
    this.searchChannel(searchValue);
  }


  /**
   * Searches the list of users based on the search keyword and updates the result list.
   * @param searchword The search keyword for users.
   */
  searchUser(searchword: string) {
    this.userList.forEach((user) => {
      const profile = user.username || '';
      const mail = user.email || '';
      if (
        profile.toLowerCase().includes(searchword) ||
        mail.toLowerCase().includes(searchword)
      ) {
        this.resultUser.push(user);
      }
    });
  }


  /**
   * Searches the list of channels based on the search keyword and updates the result list.
   * @param searchword - The search keyword for channels.
   */
  searchChannel(searchword: string) {
    this.channelList.forEach((channel: any) => {
      const channelName = channel.name || '';
      if (channelName.toLowerCase().includes(searchword)) {
        this.resultChannel.push(channel);
        this.proofChannelName(channel.id);
      }
    });
  }


  /**
   * Retrieves the name of the channel based on the channel ID.
   * @param id - The channel ID.
   * @returns 
   */
  async proofChannelName(id: string) {
    const channelRef = doc(this.firestore, 'channels', id);
    const channelDoc = await getDoc(channelRef);

    if (channelDoc.exists()) {
      const doc = channelDoc.data();
      return doc['channelName'];
    } else {
      return false;
    }
  }


  /**
   * Selects a channel and updates the current message ID for that channel.
   * @param channel - The channel object to be selected.
   */
  selectChannel(channel: any) {
    this.messageIdSubject.next(channel.id);
    this.isChannel = true;
  }


  /**
   * Selects a user and updates the current message ID for that user.
   * @param user - The user object to be selected.
   */
  selectUser(user: User) {
    this.messageIdSubject.next(user.userId);
    this.isChannel = false;
  }
}
