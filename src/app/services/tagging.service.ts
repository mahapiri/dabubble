import { inject, Injectable, OnDestroy, OnInit } from '@angular/core';
import { ChannelService } from './channel.service';
import { BehaviorSubject, Subscription, take } from 'rxjs';
import { Channel, ChannelMember } from '../../models/channel.class';
import { User } from '../../models/user.class';
import { doc, Firestore, onSnapshot } from '@angular/fire/firestore';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class TaggingService implements OnDestroy {
  private firestore: Firestore = inject(Firestore);
  private channelService: ChannelService = inject(ChannelService);
  private userService: UserService = inject(UserService);
  private channelSubscription: Subscription = new Subscription();
  private userSubscription: Subscription = new Subscription();
  private channelAllSubscription: Subscription = new Subscription();
  public memberSelectedChannel = new BehaviorSubject<any>(null);
  memberSelectedChannel$ = this.memberSelectedChannel.asObservable();
  public memberSelectedThread = new BehaviorSubject<any>(null);
  memberSelectedThread$ = this.memberSelectedThread.asObservable();
  public memberSelectedNewMessage = new BehaviorSubject<any>(null);
  memberSelectedNewMessage$ = this.memberSelectedNewMessage.asObservable();
  public memberSelectedDirectMessage = new BehaviorSubject<any>(null);
  memberSelectedDirectMessage$ = this.memberSelectedDirectMessage.asObservable();

  public channelSelectedDirectMessage = new BehaviorSubject<any>(null);
  channelSelectedDirectMessage$ = this.channelSelectedDirectMessage.asObservable();

  public channelSelectedThread = new BehaviorSubject<any>(null);
  channelSelectedThread$ = this.channelSelectedThread.asObservable();

  public channelSelectedNewMessage = new BehaviorSubject<any>(null);
  channelSelectedNewMessage$ = this.channelSelectedNewMessage.asObservable();

  public channelSelectedChannel = new BehaviorSubject<any>(null);
  channelSelectedChannel$ = this.channelSelectedChannel.asObservable();

  currentChannelID: string = '';
  currentChannelMember: ChannelMember[] = [];
  currentUserlist: User[] = [];
  currentChannellist: Channel[] = [];
  userList$ = this.userService.userList$;

  /**
   * subscribes the selected channel
   */
  constructor() {
    this.channelSubscription = this.channelService.selectedChannel$.subscribe(
      (channel) => {
        this.currentChannelMember = [];
        this.currentChannelID = channel?.channelID || '';
        let member = channel?.channelMember;
        member?.forEach((member) => {
          this.setActualProfileState(member);
          this.currentChannelMember.push(member);
        });
      }
    );

    this.channelAllSubscription = this.userService.userChannels$.subscribe((channels) => {
      this.currentChannellist = []
      channels.forEach((channel) => {
        this.currentChannellist.push(channel);
      })
    }
    )

    this.userSubscription = this.userList$.subscribe(user => {
      this.currentUserlist = [];
      user.forEach((profile) => {
        this.currentUserlist.push(profile);
      })
    })
  }

  setActualProfileState(member: ChannelMember) {
    this.userList$.subscribe((user) => {
      user.forEach((profile) => {
        if (member.userId == profile.userId) {
          member.state = profile.state;
        }
      });
    });
  }

  /**
   * unsubscribes the channel subscription to get the selected channel
   */
  ngOnDestroy(): void {
    this.channelSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
    this.channelAllSubscription.unsubscribe();
    // console.log('unsub');
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
  selectMemberChannel(member: ChannelMember) {
    this.memberSelectedChannel.next(member);
  }

  /**
   * get the selected member
   */
  selectMemberThread(member: ChannelMember) {
    this.memberSelectedThread.next(member);
  }

  /**
   * get the selected member
   */
  selectMemberNewMessage(member: ChannelMember) {
    this.memberSelectedNewMessage.next(member);
  }

  /**
   * get the selected member
   */
  selectMemberDirectMessage(member: ChannelMember) {
    this.memberSelectedDirectMessage.next(member);
  }




  /**
   * get the selected channel
   */
  selectChannelDirectMessage(channel: Channel) {
    this.channelSelectedDirectMessage.next(channel);
  }

  /**
   * get the selected channel
   */
  selectChannelThread(channel: Channel) {
    this.channelSelectedThread.next(channel);
  }

  /**
   * get the selected channel
   */
  selectChannelNewMessage(channel: Channel) {
    this.channelSelectedNewMessage.next(channel);
  }

  /**
   * get the selected channel
   */
  selectChannelChannel(channel: Channel) {
    this.channelSelectedChannel.next(channel);
  }
}
