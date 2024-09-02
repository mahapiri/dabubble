import { inject, Injectable, OnDestroy, OnInit } from '@angular/core';
import { UserService } from './user.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { User } from '../../models/user.class';
import { doc, Firestore, getDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class NewMessageService implements OnInit, OnDestroy {
  private firestore: Firestore = inject(Firestore);
  private userService: UserService = inject(UserService);
  private userServiceSubscription: Subscription = new Subscription();

  private searchwordSubject = new BehaviorSubject<string>('');
  searchword$ = this.searchwordSubject.asObservable();

  private messageIdSubject = new BehaviorSubject<string>('');
  messageId$ = this.messageIdSubject.asObservable();

  userList: User[] = [];
  channelList: any = [];
  currentUserId: string = '';
  resultUser: User[] = [];
  resultChannel: any = [];


  constructor() {
    const currentUserSubscription = this.userService.currentUser$.subscribe(user => {
      this.currentUserId = user?.userId || '';
    });

    const userListSubscription = this.userService._userList.subscribe(userList => {
      this.userList = userList;

      const currentUser = this.userList.find(profile => this.currentUserId === profile.userId);

      if (currentUser) {
        currentUser.userChannels.forEach(async (id: any) => {
          const channelName = await this.proofChannelName(id);
          this.channelList.push(
            {
              name: channelName,
              id: id
            }
          );
        });
      }
    });

    this.userServiceSubscription.add(currentUserSubscription);
    this.userServiceSubscription.add(userListSubscription);
  }


  ngOnInit(): void {

  }


  ngOnDestroy(): void {
    this.userServiceSubscription.unsubscribe();
    console.log('unsub new msg service')
  }


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


  searchUser(searchword: string) {
    this.userList.forEach((user) => {
      const profile = user.username || '';
      const mail = user.email || '';
      if (profile.toLowerCase().includes(searchword) || mail.toLowerCase().includes(searchword)) {
        this.resultUser.push(user);
      }
    })
  }


  searchChannel(searchword: string) {
    this.channelList.forEach((channel: any) => {
      const channelName = channel.name || ''
      if (channelName.toLowerCase().includes(searchword)) {
        this.resultChannel.push(channel);
        this.proofChannelName(channel.id);
      }
    })
  }


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


  selectChannel(channel: any) {
    this.messageIdSubject.next(channel.id);
  }


  selectUser(user: User) {
    this.messageIdSubject.next(user.userId);
  }
}
