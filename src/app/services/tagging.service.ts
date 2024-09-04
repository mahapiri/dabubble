import { inject, Injectable, OnDestroy, OnInit } from '@angular/core';
import { ChannelService } from './channel.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Channel, ChannelMember } from '../../models/channel.class';
import { User } from '../../models/user.class';
import { doc, Firestore, onSnapshot } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class TaggingService implements OnInit, OnDestroy {
  private firestore: Firestore = inject(Firestore);
  private channelService: ChannelService = inject(ChannelService);
  private channelSubscription: Subscription = new Subscription();
  public memberSelectedChannel = new BehaviorSubject<any>(null);
  memberSelectedChannel$ = this.memberSelectedChannel.asObservable();
  public memberSelectedThread = new BehaviorSubject<any>(null);
  memberSelectedThread$ = this.memberSelectedThread.asObservable();
  public memberSelectedNewMessage = new BehaviorSubject<any>(null);
  memberSelectedNewMessage$ = this.memberSelectedNewMessage.asObservable();

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


  setSelectedChannel(channel: any) {
    const id = channel.id;
    onSnapshot(doc(this.firestore, 'channels', id), (doc) => {
      this.channelService.selectedChannel.next(new Channel(doc.data()));
    });
  }


  /**
  * get the selected member
  */
  selectMemberChannel(member: User) {
    this.memberSelectedChannel.next(member);
  }


  /**
  * get the selected member
  */
  selectMemberThread(member: User) {
    this.memberSelectedThread.next(member);
  }


  /**
  * get the selected member
  */
  selectMemberNewMessage(member: User) {
    this.memberSelectedNewMessage.next(member);
  }
}
