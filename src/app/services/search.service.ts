import { inject, Injectable, OnDestroy, OnInit } from '@angular/core';
import { UserService } from './user.service';
import { User } from '../../models/user.class';
import { Subscription } from 'rxjs';
import { Channel, ChannelMessage } from '../../models/channel.class';
import { DirectMessageService } from './direct-message.service';
import { collection, Firestore, getDoc, getDocs, query, where } from '@angular/fire/firestore';
import { DmMessage } from '../../models/direct-message.class';
import { ChannelService } from './channel.service';
import { ChannelMessageService } from './channel-message.service';
import { replyToMessage, Thread, ThreadMessage } from '../../models/thread.class';
import { ThreadService } from './thread.service';

@Injectable({
  providedIn: 'root'
})
export class SearchService implements OnInit, OnDestroy {
  private firestore: Firestore = inject(Firestore);
  private userService: UserService = inject(UserService);
  private directMessageService: DirectMessageService = inject(DirectMessageService);
  private channelService: ChannelService = inject(ChannelService);
  private channelMessageService: ChannelMessageService = inject(ChannelMessageService);
  private threadService: ThreadService = inject(ThreadService);
  private userListSubscription: Subscription = new Subscription();
  private currentUserChannelsSubscription: Subscription = new Subscription();
  private currentUserSubscription: Subscription = new Subscription();
  private dmSubscription: Subscription = new Subscription();
  private threadSubscription: Subscription = new Subscription();


  currentUserID: string = '';
  channelList: Channel[] = [];
  userList: User[] = [];
  directMessage: DmMessage[] = [];
  channelMessage: ChannelMessage[] = [];
  threads: Thread[] = [];
  // channelMessage: any;
  channelListMsg: any = [];
  threadListMsg: any = [];

  resultDM: DmMessage[] = [];
  resultUser: User[] = [];
  // resultChannel: ChannelMessage[] = [];
  resultChannel: any;
  resultThread: any = [];


  isOn: boolean = false;


  constructor() { }


  ngOnInit() {
    if(this.isOn) {
      this.userListSubscription = this.userService.userList$.subscribe((user) => {
        this.userList = user;
      });
      this.currentUserChannelsSubscription = this.userService.userChannels$.subscribe((channels) => {
        this.channelList = channels;
      });
      // this.dmSubscription = this.dmService.messages$.subscribe((message) =>  {
      //   console.log(message);
      // });
      this.currentUserSubscription = this.userService.currentUser$.subscribe((user) => {
        if (user) {
          this.currentUserID = user?.userId || '';
        }
      })
      this.threadSubscription = this.threadService.threads$.subscribe((thread) => {
        if (thread) {
          this.threads = thread;
        }
      })
    }

  }


  ngOnDestroy(): void {
    this.userListSubscription.unsubscribe();
    this.currentUserChannelsSubscription.unsubscribe();
    this.currentUserSubscription.unsubscribe();
    // this.dmSubscription.unsubscribe();
    this.threadSubscription.unsubscribe();
    console.log('unsub');
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
    this.channelListMsg = [];
    for (const channel of this.channelList) {
      const id = channel.channelID;
      if (id) {
        const channelList: any = {
          channelID: channel.channelID,
          channelMember: channel.channelMember,
          channelName: channel.channelName,
          createdBy: channel.createdBy,
          description: channel.description,
          messages: []
        }
        this.channelListMsg.push(channelList);
        const arrayIndex = this.channelListMsg.length - 1;
        await this.getChannelMessage(arrayIndex, id);
      }
    }
  }


  async getChannelMessage(arrayIndex: number, id: string) {
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

      if (this.channelListMsg[arrayIndex] && this.channelListMsg[arrayIndex].messages) {
        this.channelListMsg[arrayIndex].messages.push(message);
      }
    });
  }


  async getAllThreads() {
    this.threadListMsg = [];
    for (const thread of this.threads) {
      const id = thread.threadID;
      if(id) {
        const threadList: any = {
          channelName: thread.channelName,
          replyToMessage: thread.replyToMessage,
          threadID: thread.threadID,
          messages: []
        }
        this.threadListMsg.push(threadList);
        const arrayIndex = this.threadListMsg.length - 1;
        await this.getThreadMessage(arrayIndex, id);
      }
    }
  }


  async getThreadMessage(arrayIndex: number, id: string) {
    const messageRef = collection(this.firestore, `threads/${id}/messages`);
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

      if (this.threadListMsg[arrayIndex] && this.threadListMsg[arrayIndex].messages) {
        this.threadListMsg[arrayIndex].messages.push(message);
      }
    });
  }


  async search(searchInputValue: string) {
    this.resultDM = [];
    this.resultUser = [];
    this.resultChannel = [];
    this.resultThread = [];

    if (!searchInputValue || searchInputValue.trim() === '') {
      return;
    }

    const searchWord = searchInputValue.trim().toLowerCase();

    this.searchDM(searchWord);
    this.searchUser(searchWord);
    this.searchChannel(searchWord);
    this.searchThread(searchWord);
  }


  async searchDM(searchWord: string) {
    const tempResult: any = []
    let ids: any = [];

    this.directMessage.forEach((message) => {
      const text = message.text || '';

      if (text.toLowerCase().includes(searchWord)) {
        if (ids.indexOf(message.id) === -1) {
          tempResult.push(message);
          ids.push(message.id);
        }
      }
    });
    this.resultDM = tempResult;
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

    for (const channel of this.channelListMsg) {
      const messages = channel['messages'];

      for (const message of messages) {
        const text = message.text || '';
        if (text.toLowerCase().includes(searchWord)) {
          this.resultChannel.push({
            channelId: channel.channelID,
            channelName: channel.channelName,
            message: message
          });
        }
      }
    }
  }


  async searchThread(searchWord: string) {
    const tempResult: any = []
    let ids: any = [];

    for (const thread of this.threadListMsg) {
      const messages = thread['messages'];
      const replyTo = thread['replyToMessage'];

      for (const message of messages) {
        const text = message.text || '';
        if (text.toLowerCase().includes(searchWord)) {
          if (ids.indexOf(message.id) === -1) {
            tempResult.push({
              threadId: thread.channelID,
              channelName: thread.channelName,
              message: message,
              replyToMessage: replyTo
            });
            ids.push(message.id);
          }
        }
      }
      this.resultThread = tempResult;
    }
  }
}