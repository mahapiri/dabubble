import { Injectable, OnDestroy } from '@angular/core';
import {
  addDoc,
  collection,
  doc,
  Firestore,
  updateDoc,
  arrayUnion,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
} from '@angular/fire/firestore';
import { UserService } from './user.service';
import { User } from '../../models/user.class';
import { Channel } from '../../models/channel.class';
import { ChannelMessage } from '../../models/channel.class';
import { BehaviorSubject } from 'rxjs';
import { ChatService } from './chat.service';

@Injectable({
  providedIn: 'root',
})
export class ChannelService implements OnDestroy {
  private selectedChannel = new BehaviorSubject<Channel | null>(null);
  selectedChannel$ = this.selectedChannel.asObservable();

  private channelMessagesSubjects = new BehaviorSubject<ChannelMessage[]>([]);
  channelMessages$ = this.channelMessagesSubjects.asObservable();

  channelID?: string = '';
  createdBy: string = '';
  previousDate: string | null = null;

  channelMessages: ChannelMessage[] = [];

  unsubMessages!: () => void;

  /**
   * Subscribes to the `selectedChannel$` observable to react to changes in the selected channel.
   * Then, updates the ChannelID and listens for changes (read) in the message list.
   */
  constructor(
    private firestore: Firestore,
    private userService: UserService,
    private chatService: ChatService
  ) {
    this.selectedChannel$.subscribe((channel) => {
      if (channel) {
        this.setChannelId(channel);
        this.unsubMessages = this.subMessageList();
      }
    });
  }

  /**
   * Sets the currently selected channel. It updates the `BehaviorSubject` `selectedChannel`, notifying all subscribers of the change.
   * @param channel - The `Channel` object to be set as the currently selected channel.
   */
  setSelectedChannel(channel: Channel) {
    this.selectedChannel.next(channel);
    //this.setChannelId(channel.channelID);
  }

  /**
   * Updates the channelID variable based on the selected Channel.
   * @param channel Channel Object
   */
  setChannelId(channel: Channel) {
    this.channelID = channel.channelID;
  }

  /**
   * Creates a new channel and adds it to the Firestore database.
   * @param name - The name of the new channel.
   * @param description - A brief description of the new channel.
   * @param user - An array of `User` objects who will be members of the new channel.
   *
   * - Retrieves user info who is creating the channel. To set the `createdBy` field.
   * - Constructs a `Channel` object with the user-info
   * - Adds the new channel to the Firestore database.
   * - Sets the `channelID` property of the service to the ID of the newly created channel.
   * - Then updates the Channel in Firestore with the channel ID.
   * - Updates the `userService` with the new channel ID for each user. This may involve adding the new channel ID to the users' channel lists in the database.
   */
  async addChannel(name: string, description: string, user: User[]) {
    await this.getCreatedByUser();
    const newChannel: Channel = this.setChannelObject(name, description, user);
    const channelRef = await addDoc(
      this.getChannelRef(),
      newChannel.getChannelJson()
    );

    this.channelID = channelRef.id;
    await this.updateChannelWithID(channelRef.id);
    this.userService.updateUserChannels(user, this.channelID);
  }

  async getChannelById(channelID: string) {
    const channelRef = doc(this.firestore, 'channels', channelID);
    const channelDoc = await getDoc(channelRef);
    if (channelDoc.exists()) {
      return new Channel(channelDoc.data());
    } else {
      return undefined;
    }
  }

  async updateChannelWithID(channelID: string) {
    const channelRef = doc(this.firestore, 'channels', channelID);
    await updateDoc(channelRef, { channelID: channelID });
  }

  setChannelObject(
    name: string,
    description: string,
    user: User[],
    channelID?: string
  ): Channel {
    return new Channel({
      channelID: channelID || '',
      channelName: name,
      channelMember: User.convertUsersToJson(user),
      createdBy: this.createdBy,
      description: description,
    });
  }

  async addChannelToContact(userdocId: string, channelId: string) {
    await updateDoc(doc(this.firestore, 'users', userdocId), {
      userChannels: arrayUnion(channelId),
    });
  }

  async getCreatedByUser() {
    let userRef = (
      await getDoc(doc(this.firestore, 'users', this.userService.userID))
    ).data();
    if (userRef) {
      this.createdBy = userRef['username'];
    }
  }

  //aufrufen wenn nachricht geschrieben wurde
  async addMessage(text: string) {
    this.userService.currentUser$.subscribe(async (currentUser) => {
      if (currentUser) {
        const newMessage: ChannelMessage = this.setMessageWithUser(
          text,
          currentUser
        );
        const messageRef = await addDoc(
          this.getMessageRef(),
          newMessage.getMessageJson()
        );
        console.log('Message added:', messageRef.id);
      }
    });
  }

  /**
   * Subscribes to changes in the messages collection of the currently selected channel.
   * Fetches the latest list of messages and updates the channelMessagesSubjects BehaviorSubject.
   * Orders the messages by the "date" and "time" they are written in ascending order first to be able to call the isFirstMessageOfDay Function to determine which message is the first one of the day.
   * Then reverses the Order, so older messages are shown higher up in the chat and the latest messages are shown at the bottom.
   * @returns - the unsubscribe function for the onSnapshot listener.
   */
  subMessageList() {
    const q = query(
      this.getMessageRef(),
      orderBy('date', 'asc'),
      orderBy('time', 'asc'),
      limit(100)
    );

    return onSnapshot(q, (list) => {
      this.channelMessages = [];
      this.previousDate = null;

      list.forEach((message) => {
        const data = message.data();
        const currentMessage = this.setMessageObject(message.id, data);
        this.chatService.setFirstMessageOfDay(currentMessage);
        this.channelMessages.push(currentMessage);
      });

      this.channelMessages.reverse();
      this.channelMessagesSubjects.next(this.channelMessages);
      console.log('Message received:', this.channelMessages);
    });
  }

  setMessageObject(id: string, data: any) {
    return new ChannelMessage({
      id: id,
      text: data['text'],
      time: data['time'],
      date: data['date'],
      authorName: data['authorName'],
      authorId: data['authorId'],
      profileImage: data['profileImage'],
      isFirstMessageOfDay: false,
    });
  }

  setMessageWithUser(text: string, user: User): ChannelMessage {
    const now = new Date();

    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };

    return new ChannelMessage({
      id: '',
      text: text,
      time: now.toLocaleTimeString('de-DE', timeOptions),
      date: now.toISOString().split('T')[0],
      authorName: user.username,
      authorId: user.userId,
      profileImage: user.profileImage,
      isFirstMessageOfDay: false,
    });
  }

  getChannelRef() {
    return collection(this.firestore, 'channels');
  }

  getMessageRef() {
    return collection(this.firestore, `channels/${this.channelID}/messages`);
  }

  ngOnDestroy() {
    this.unsubMessages();
  }
}
