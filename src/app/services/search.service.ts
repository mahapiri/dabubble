import { inject, Injectable, OnDestroy, OnInit } from '@angular/core';
import { UserService } from './user.service';
import { User } from '../../models/user.class';
import { Subscription } from 'rxjs';
import { Channel } from '../../models/channel.class';
import { DirectMessageService } from './direct-message.service';
import { collection, Firestore, getDoc, getDocs, onSnapshot, query, where } from '@angular/fire/firestore';
import { DmMessage } from '../../models/direct-message.class';

@Injectable({
  providedIn: 'root'
})
export class SearchService implements OnInit, OnDestroy {
  private userService: UserService = inject(UserService);
  private dmService: DirectMessageService = inject(DirectMessageService);
  private userListSubscription: Subscription = new Subscription();
  private currentUserChannelsSubscription: Subscription = new Subscription();
  private dmSubscription: Subscription = new Subscription();

  userList: User[] = [];
  channelList: Channel[] = [];
  currentUserID: string = '';
  directMessage: DmMessage[] = [];

  constructor() { 
    this.userListSubscription = this.userService.userList$.subscribe((user) =>  {
      this.userList = user;
    });
    this.currentUserChannelsSubscription = this.userService.userChannels$.subscribe((channels) =>  {
      this.channelList = channels;
    });
    // this.dmSubscription = this.dmService.messages$.subscribe((message) =>  {
    //   console.log(message);
    // });
    this.userService.currentUser$.subscribe((user) => {
      if(user) {
        this.currentUserID = user?.userId
      }

    })
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
      this.userListSubscription.unsubscribe();
      this.currentUserChannelsSubscription.unsubscribe();
      // this.dmSubscription.unsubscribe();
  }

  async getAllDM() {
    this.directMessage = [];
    const collectionRef = this.dmService.getCollectionRef();

    const q = query(collectionRef, where("userIDs", "array-contains", this.currentUserID));

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      const dmID = doc.id;
      this.getMessage(dmID);
    })
  }

  async getMessage(dmID: string) {
    const messageRef = this.dmService.getMessageRefForId(dmID);
    const message = await getDocs(messageRef);

    message.forEach((doc) => {
      const data = doc.data();

      const message: any = {
        authorId: data['authorId'] || '',
        authorName: data['authorName'] || '',  ///snap
        authorImg: data['authorImg'] || '',     // snap
        authorstate: data['authorstate'] || '',  // snap
        profileId: data['profileId'] || '',
        profileName: data['profileName'] || '',  // snap
        profileImg: data['profileImg'] || '', //snap
        profileState: data['profileState'] || '', /// snap
        date: data['date'] || '',
        time: data['time'] || '',
        text: data['text'] || '',
        reaction: data['reaction'] || '',
        file: data['file'] || '',
        id: data['id'] || '',
        isFirstMessageOfDay: data['isFirstMessageOfDay'] || '',
      }

      this.directMessage.push(message);

      console.log(this.directMessage)
    })
  }


}
