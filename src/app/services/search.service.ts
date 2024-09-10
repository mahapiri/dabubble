import { inject, Injectable } from '@angular/core';
import { UserService } from './user.service';
import { User } from '../../models/user.class';
import { Subscription } from 'rxjs';
import { Channel, ChannelMessage } from '../../models/channel.class';
import { DirectMessageService } from './direct-message.service';
import {
  collection,
  Firestore,
  getDoc,
  getDocs,
  query,
  where,
} from '@angular/fire/firestore';
import { DmMessage } from '../../models/direct-message.class';
import { Thread } from '../../models/thread.class';
import { ThreadService } from './thread.service';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private firestore: Firestore = inject(Firestore);
  private userService: UserService = inject(UserService);
  private directMessageService: DirectMessageService =
    inject(DirectMessageService);
  private threadService: ThreadService = inject(ThreadService);
  private userListSubscription: Subscription = new Subscription();
  private currentUserChannelsSubscription: Subscription = new Subscription();
  private currentUserSubscription: Subscription = new Subscription();
  private threadSubscription: Subscription = new Subscription();

  currentUserID: string = '';
  channelList: Channel[] = [];
  userList: User[] = [];
  directMessage: DmMessage[] = [];
  channelMessage: ChannelMessage[] = [];
  threads: Thread[] = [];
  channelListMsg: any = [];
  threadListMsg: any = [];

  resultDM: DmMessage[] = [];
  resultUser: User[] = [];
  resultChannel: any = [];
  resultThread: any = [];
  timer: boolean = false;

  constructor() {}

  /**
   * Starts subscriptions to listen for user, channel, and thread updates.
   */
  async startSubscription() {
    this.userListSubscription = this.userService.userList$.subscribe((user) => {
      this.userList = user;
    });
    this.currentUserChannelsSubscription =
      this.userService.userChannels$.subscribe((channels) => {
        this.channelList = channels;
      });
    this.currentUserSubscription = this.userService.currentUser$.subscribe(
      (user) => {
        if (user) {
          this.currentUserID = user?.userId || '';
        }
      }
    );
    this.threadSubscription = this.threadService.threads$.subscribe(
      (thread) => {
        if (thread) {
          this.threads = thread;
        }
      }
    );
  }


  /**
   * Stops all active subscriptions when the service is no longer needed.
   */
  stopSubscription() {
    this.userListSubscription.unsubscribe();
    this.currentUserChannelsSubscription.unsubscribe();
    this.currentUserSubscription.unsubscribe();
    this.threadSubscription.unsubscribe();
  }


  /**
   * Sets a timer to prevent duplicate data fetching within a certain period.
   */
  setTimerToTrue() {
    this.timer = true;
    setTimeout(() => {
      this.timer = false;
    }, 60000);
  }


  /**
   * Retrieves all direct messages for the current user.
   */
  async getAllDM() {
    if (!this.timer) {
      this.directMessage = [];
      const collectionRef = this.directMessageService.getCollectionRef();

      const q = query(
        collectionRef,
        where('userIDs', 'array-contains', this.currentUserID)
      );

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        const dmID = doc.id;
        this.getDmMessage(dmID);
      });
    }
  }


  /**
   * Fetches the messages for a given direct message ID.
   * @param dmID - The ID of the direct message.
   */
  async getDmMessage(dmID: string) {
    const messageRef = this.directMessageService.getMessageRefForId(dmID);
    const message = await getDocs(messageRef);

    message.forEach((doc) => {
      const data = doc.data();

      const message: any = {
        authorId: data['authorId'] || '',
        authorName: data['authorName'] || '',
        authorImg: data['authorImg'] || '',
        authorstate: data['authorstate'] || '',
        profileId: data['profileId'] || '',
        profileName: data['profileName'] || '',
        profileImg: data['profileImg'] || '',
        profileState: data['profileState'] || '',
        date: data['date'] || '',
        time: data['time'] || '',
        text: data['text'] || '',
        reaction: data['reaction'] || '',
        file: data['file'] || '',
        id: data['id'] || '',
        isFirstMessageOfDay: data['isFirstMessageOfDay'] || '',
      };
      this.directMessage.push(message);
    });
  }


  /**
   * Fetches all channel messages for the current user.
   */
  async getAllChannel() {
    if (!this.timer) {
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
            messages: [],
          };
          this.channelListMsg.push(channelList);
          const arrayIndex = this.channelListMsg.length - 1;
          await this.getChannelMessage(arrayIndex, id);
        }
      }
    }
  }


  /**
   * Fetches messages for a given channel ID.
   * @param arrayIndex - The index of the channel in the channel list.
   * @param id - The ID of the channel.
   */
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
        profileImage: data['profileImg'],
        text: data['text'],
        time: data['time'],
      };

      if (
        this.channelListMsg[arrayIndex] &&
        this.channelListMsg[arrayIndex].messages
      ) {
        this.channelListMsg[arrayIndex].messages.push(message);
      }
    });
  }


  /**
   * Fetches all threads for the current user.
   */
  async getAllThreads() {
    if (!this.timer) {
      this.threadListMsg = [];
      for (const thread of this.threads) {
        const id = thread.threadID;
        if (id) {
          const threadList: any = {
            channelName: thread.channelName,
            replyToMessage: thread.replyToMessage,
            threadID: thread.threadID,
            messages: [],
          };
          this.threadListMsg.push(threadList);
          const arrayIndex = this.threadListMsg.length - 1;
          await this.getThreadMessage(arrayIndex, id);
        }
      }
    }
  }


  /**
   * Fetches messages for a given thread ID.
   * @param arrayIndex - The index of the thread in the thread list.
   * @param id - The ID of the thread.
   */
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
        profileImage: data['profileImg'],
        text: data['text'],
        time: data['time'],
      };

      if (
        this.threadListMsg[arrayIndex] &&
        this.threadListMsg[arrayIndex].messages
      ) {
        this.threadListMsg[arrayIndex].messages.push(message);
      }
    });
  }


  /**
   * Performs a search across direct messages, users, channels, and threads.
   * @param searchInputValue - The value to search for.
   * @returns 
   */
  async search(searchInputValue: string) {
    this.resultUser = [];
    this.resultChannel = [];
    this.resultThread = [];
    if (!this.timer) {
      this.resultDM = [];
    }

    if (!searchInputValue || searchInputValue.trim() === '') {
      return;
    }

    const searchWord = searchInputValue.trim().toLowerCase();

    this.searchDM(searchWord);
    this.searchUser(searchWord);
    this.searchChannel(searchWord);
    this.searchThread(searchWord);
  }


  /**
   * Searches direct messages for the specified search term.
   * @param searchWord - The search term to look for in direct messages.
   */
  async searchDM(searchWord: string) {
    const tempResult: any = [];
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
    this.updateDMsWithCurrentUserInfo();
  }


  /**
   * Updates direct messages with the current user's information.
   */
  updateDMsWithCurrentUserInfo() {
    this.resultDM.forEach((dm) => {
      if (this.currentUserID === dm.profileId) {
        dm.profileImg = dm.authorImg || '';
        dm.profileName = dm.authorName || '';
      }
    });
  }


  /**
   * Searches the list of users based on the search term.
   * @param searchWord - The search term to look for in user profiles.
   */
  async searchUser(searchWord: string) {
    this.userList.forEach((user) => {
      const profile = user.username || '';
      if (profile.toLowerCase().includes(searchWord)) {
        this.resultUser.push(user);
      }
    });
  }


  /**
   * Searches channels and their messages for the specified search term.
   * @param searchWord - The search term to look for in channels and messages.
   */
  async searchChannel(searchWord: string) {
    const tempResult: any = [];
    let ids: any = [];

    for (const channel of this.channelListMsg) {
      const messages = channel['messages'];

      for (const message of messages) {
        const text = message.text || '';
        if (text.toLowerCase().includes(searchWord)) {
          if (ids.indexOf(message.id) === -1) {
            tempResult.push({
              channelID: channel.channelID,
              channelName: channel.channelName,
              message: message,
            });
            ids.push(message.id);
          }
        }
      }
    }
    this.resultChannel = tempResult;
  }


  /**
   * Searches threads and their messages for the specified search term.
   * @param searchWord - The search term to look for in threads and messages.
   */
  async searchThread(searchWord: string) {
    const tempResult: any = [];
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
              replyToMessage: replyTo,
            });
            ids.push(message.id);
          }
        }
      }
      this.resultThread = tempResult;
    }
  }


  /**
   * Retrieves the channel that contains a specific message ID.
   * @param messageId - The ID of the message to search for.
   */
  async getChannel(messageId: string): Promise<any> {
    const channelRef = collection(this.firestore, 'channels');
    const channelsSnapshot = await getDocs(channelRef);

    for (const channelDoc of channelsSnapshot.docs) {
      const messageRef = collection(channelDoc.ref, 'messages');
      const q = query(messageRef, where('id', '==', messageId));
      const messagesSnapshot = await getDocs(q);

      if(!messagesSnapshot.empty) {
        let channel = channelDoc.data()
        return channel;
      }
    }
    return null;
  }
}
