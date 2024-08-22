import { inject, Injectable, OnDestroy, OnInit } from '@angular/core';
import { UserService } from './user.service';
import { User } from '../../models/user.class';
import { Subscription } from 'rxjs';
import { Channel, ChannelMessage } from '../../models/channel.class';
import { DirectMessageService } from './direct-message.service';
import { collection, Firestore, getDocs, query, where } from '@angular/fire/firestore';
import { DmMessage } from '../../models/direct-message.class';
import { ChannelService } from './channel.service';
import { ChannelMessageService } from './channel-message.service';

@Injectable({
  providedIn: 'root'
})
export class SearchService implements OnInit, OnDestroy {
  private firestore: Firestore = inject(Firestore);
  private userService: UserService = inject(UserService);
  private directMessageService: DirectMessageService = inject(DirectMessageService);
  private channelService: ChannelService = inject(ChannelService);
  private channelMessageService: ChannelMessageService = inject(ChannelMessageService);
  private userListSubscription: Subscription = new Subscription();
  private currentUserChannelsSubscription: Subscription = new Subscription();
  private dmSubscription: Subscription = new Subscription();


  currentUserID: string = '';
  channelList: Channel[] = [];
  userList: User[] = [];
  directMessage: DmMessage[] = [];
  channelMessage: ChannelMessage[] = [];

  resultDM: DmMessage[] = [];
  resultUser: User[] = [];
  resultChannel: ChannelMessage[] = [];


  constructor() {
    this.userListSubscription = this.userService.userList$.subscribe((user) => {
      this.userList = user;
    });
    this.currentUserChannelsSubscription = this.userService.userChannels$.subscribe((channels) => {
      this.channelList = channels;
    });
    // this.dmSubscription = this.dmService.messages$.subscribe((message) =>  {
    //   console.log(message);
    // });
    this.userService.currentUser$.subscribe((user) => {
      if (user) {
        this.currentUserID = user?.userId || '';
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
    const collectionRef = this.directMessageService.getCollectionRef();

    const q = query(collectionRef, where("userIDs", "array-contains", this.currentUserID));

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      const dmID = doc.id;
      this.getDmMessage(dmID);
    })
  }


  async getDmMessage(dmID: string) {
    const messageRef = this.directMessageService.getMessageRefForId(dmID);
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
    })
  }


  async getAllChannel() {
    this.channelMessage = [];
    for (const channel of this.channelList) {
      const id = channel.channelID;
      if (id) {
        await this.getChannelMessage(id);
      }
    }
  }


  async getChannelMessage(id: string) {
    const messageRef = collection(this.firestore, `channels/${id}/messages`);
    const messages = await getDocs(messageRef);

    messages.forEach((doc) => {
      const data = doc.data();

      const message: any = {
        authorId: data['authorId'],
        authorName: data['authorName'],
        date: data['date'],
        id: data['id'],
        isFirstMessageOfDay: data['isFirstMessageOfDay'],
        profileImage: data['profileImage'],
        text: data['text'],
        time: data['time'],
      }

      this.channelMessage.push(message);
      // console.log(this.channelMessage)
    })
  }

  search(searchInputValue: string) {
    this.resultDM = [];
    this.resultUser = [];
    this.resultChannel = [];

    if (!searchInputValue || searchInputValue.trim() === '') {
      console.log('leer');
      return;
    }

    const searchWord = searchInputValue.trim().toLowerCase();

    this.searchDM(searchWord);
    this.searchUser(searchWord);
    this.searchChannel(searchWord);
  }


  async searchDM(searchWord: string) {
    this.directMessage.forEach((message) => {
      const text = message.text || '';
      if (text.toLowerCase().includes(searchWord)) {
        this.resultDM.push(message);
      }
    });
  }

  async searchUser(searchWord: string) {
    this.userList.forEach((user) => {
      const profile = user.username || '';
      if (profile.toLowerCase().includes(searchWord)) {
        this.resultUser.push(user);
      }
    });
  }

  async searchChannel(searchWord: string) {
    this.channelMessage.forEach((channel) => {
      const message = channel.text || '';
      if (message.toLowerCase().includes(searchWord)) {
        this.resultChannel.push(channel);
      }
    });
  }
}
