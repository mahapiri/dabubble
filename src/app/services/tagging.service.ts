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
  public memberSelectedChannel = new BehaviorSubject<any>(null);
  memberSelectedChannel$ = this.memberSelectedChannel.asObservable();
  public memberSelectedThread = new BehaviorSubject<any>(null);
  memberSelectedThread$ = this.memberSelectedThread.asObservable();
  public memberSelectedNewMessage = new BehaviorSubject<any>(null);
  memberSelectedNewMessage$ = this.memberSelectedNewMessage.asObservable();

  currentChannelID: string = '';
  currentChannelMember: ChannelMember[] = [];
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
}
