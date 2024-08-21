import { inject, Injectable, OnDestroy, OnInit } from '@angular/core';
import { ChannelService } from './channel.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ChannelMember } from '../../models/channel.class';
import { User } from '../../models/user.class';

@Injectable({
  providedIn: 'root'
})
export class TaggingService implements OnInit, OnDestroy {
  private channelService: ChannelService = inject(ChannelService);
  private channelSubscription: Subscription = new Subscription();
  public memberSelected = new BehaviorSubject<any>(null);
  memberSelected$ = this.memberSelected.asObservable();

  currentChannelID: string = '';
  currentChannelMember: any;


  /**
  * subscribes the selected channel
  */
  constructor() {
    this.channelSubscription = this.channelService.selectedChannel$.subscribe((channel) => {
      this.currentChannelID = channel?.channelID || '';
      this.currentChannelMember = channel?.channelMember;
    })
  }


  ngOnInit(): void { }


  /**
  * unsubscribes the channel subscription to get the selected channel
  */
  ngOnDestroy(): void {
    this.channelSubscription.unsubscribe();
    console.log('unsub');
  }


  /**
  * get the selected member
  */
  selectMember(member: User) {
    this.memberSelected.next(member);
  }
}
