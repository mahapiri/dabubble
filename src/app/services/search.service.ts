import { inject, Injectable, OnDestroy, OnInit } from '@angular/core';
import { UserService } from './user.service';
import { User } from '../../models/user.class';
import { Subscription } from 'rxjs';
import { Channel, ChannelMessage } from '../../models/channel.class';
import { DirectMessageService } from './direct-message.service';
import {
  collection,
  collectionChanges,
  Firestore,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
} from '@angular/fire/firestore';
import { DmMessage } from '../../models/direct-message.class';
import { Thread } from '../../models/thread.class';
import { ThreadService } from './thread.service';

@Injectable({
  providedIn: 'root',
})
export class SearchService implements OnInit, OnDestroy {
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

  constructor() {
    this.startSearch();
  }

  async startSearch() {
    await this.startSubscription();
  }


  async ngOnInit() {
    await this.startSubscription();
  }

  ngOnDestroy() {
    this.stopSubscription();
  }


  /**
   * Starts subscriptions to listen for user, channel, and thread updates.
   */
  async startSubscription() {
    this.userListSubscription = this.userService.userList$.subscribe((user) => {
      this.userList = user;
      // console.log(this.userList);
    });
    this.currentUserChannelsSubscription =
      this.userService.userChannels$.subscribe((channels) => {
        this.channelList = channels;
        this.getAllChannel();
      });
    this.currentUserSubscription = this.userService.currentUser$.subscribe(
      (user) => {
        if (user) {
          this.currentUserID = user?.userId || '';
          this.getAllDM();
        }
      }
    );
    this.threadSubscription = this.threadService.threads$.subscribe(
      (thread) => {
        if (thread) {
          this.threads = thread;
          // console.log(this.threads);
          this.getAllThreads();
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
   * Retrieves all direct messages for the current user.
   */
  async getAllDM() {
    this.directMessage = [];

    const collectionRef = this.directMessageService.getCollectionRef();

    const q = query(
      collectionRef,
      where('userIDs', 'array-contains', this.currentUserID)
    );

    onSnapshot(q, (querySnapshot) => {
      querySnapshot.forEach(async (doc) => {
        await this.getDmMessage(doc.id);
      });
    });
  }


  /**
   * Fetches the messages for a given direct message ID using onSnapshot for real-time updates.
   * @param dmID - The ID of the direct message.
   */
  async getDmMessage(dmID: string) {
    const messageRef = this.directMessageService.getMessageRefForId(dmID);

    onSnapshot(messageRef, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const data = change.doc.data();

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

        if (change.type === "added") {
          const exists = this.directMessage.find(msg => msg.id === message.id);
          if (!exists) {
            this.directMessage.push(message);
          }
        } else if (change.type === "modified") {
          const index = this.directMessage.findIndex(msg => msg.id === message.id);
          if (index !== -1) {
            this.directMessage[index] = message;
          }
        } else if (change.type === "removed") {
          this.directMessage = this.directMessage.filter(msg => msg.id !== message.id);
        }
      });
    });
  }


  async getAllChannel() {
    this.channelListMsg = [];

    const collectionRef = collection(this.firestore, 'channels');

    onSnapshot(collectionRef, (querySnapshot) => {
      querySnapshot.forEach(async (channelData) => {
        const channel = channelData.data();
        const id = channelData.id;
        const channelMembers = channel['channelMember'];
        if (Array.isArray(channelMembers)) {
          channelMembers.forEach((member) => {
            if (member.userId === this.currentUserID) {
              let channelExists = this.channelListMsg.find((ch: any) => ch.channelID === id);
              if (!channelExists) {
                this.channelListMsg.push({
                  ...channel,
                  channelID: id,
                  messages: []
                })
                this.getChannelMessage(id);
              }
            }
          });
        }
      });
    });
  }


  async getChannelMessage(id: string) {
    const messageRef = collection(this.firestore, `channels/${id}/messages`);

    onSnapshot(messageRef, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const data = change.doc.data();

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

        const channelIndex = this.channelListMsg.findIndex((ch: any) => ch.channelID === id);

        if (channelIndex !== -1) {
          if (change.type === "added") {
            const exists = this.channelListMsg[channelIndex].messages.find((msg: any) => msg.id === message.id);
            if (!exists) {
              this.channelListMsg[channelIndex].messages.push(message);
            }
          } else if (change.type === "modified") {
            const messageIndex = this.channelListMsg[channelIndex].messages.findIndex((msg: any) => msg.id === message.id);
            if (messageIndex !== -1) {
              this.channelListMsg[channelIndex].messages[messageIndex] = message;
            }
          } else if (change.type === "removed") {
            this.channelListMsg[channelIndex].messages = this.channelListMsg[channelIndex].messages.filter((msg: any) => msg.id !== message.id);  // Nachricht entfernen
          }
        }
      });
    });

  }


  /**
   * Fetches all threads for the current user.
   */
  async getAllThreads() {
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
    this.resultDM = [];


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

      if (messages && Array.isArray(messages)) {
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

      if (!messagesSnapshot.empty) {
        let channel = channelDoc.data()
        return channel;
      }
    }
    return null;
  }
}
