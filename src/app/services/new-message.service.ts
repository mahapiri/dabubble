import { inject, Injectable, OnDestroy, OnInit } from '@angular/core';
import { UserService } from './user.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { User } from '../../models/user.class';

@Injectable({
  providedIn: 'root'
})
export class NewMessageService implements OnInit, OnDestroy {
  private userService: UserService = inject(UserService);
  private userServiceSubscription: Subscription = new Subscription();

  private searchwordSubject = new BehaviorSubject<string>('');
  searchword$ = this.searchwordSubject.asObservable();

  userList: User[] = [];
  channelList: any = [];
  currentUserId: string = '';

  constructor() {
    this.userServiceSubscription = 
    this.userService.currentUser$.subscribe(user => {
      this.currentUserId = user?.userId || '';
    })

    this.userServiceSubscription= this.userService._userList.subscribe(user => {
      this.userList = user;

      user.forEach((profile) => {
        if(this.currentUserId == profile.userId) {
          this.channelList = profile.userChannels;
        }
      })
    })
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
      this.userServiceSubscription.unsubscribe();
      console.log('unsub new msg service')
  }


  setSearchword(searchword: string) {
    this.searchwordSubject.next(searchword);
  }
}
