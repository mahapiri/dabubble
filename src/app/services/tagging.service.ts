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

  constructor() {
    this.channelSubscription = this.channelService.selectedChannel$.subscribe((channel) => {
      this.currentChannelID = channel?.channelID || '';
      this.currentChannelMember = channel?.channelMember;
    })
  }


  ngOnInit(): void {

  }


  ngOnDestroy(): void {
    this.channelSubscription.unsubscribe();
    console.log('unsub');
  }


  getMemberList() {

  }

  selectMember(member: User) {
    this.memberSelected.next(member);
  }
}
