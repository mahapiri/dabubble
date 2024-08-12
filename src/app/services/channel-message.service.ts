import { Injectable } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  updateDoc,
} from '@angular/fire/firestore';
import { UserService } from './user.service';
import { User } from '../../models/user.class';
import { ChatService } from './chat.service';
import { ChannelService } from './channel.service';
import { ChannelMessage } from '../../models/channel.class';
import { BehaviorSubject } from 'rxjs';
import { query } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class ChannelMessageService {
  private channelMessagesSubjects = new BehaviorSubject<ChannelMessage[]>([]);
  channelMessages$ = this.channelMessagesSubjects.asObservable();

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
    private chatService: ChatService,
    private channelService: ChannelService
  ) {
    this.channelService.selectedChannel$.subscribe((channel) => {
      if (channel) {
        this.channelService.setChannelId(channel);
        this.unsubMessages = this.subMessageList();
      }
    });
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
          this.getMessagesRef(),
          newMessage.getMessageJson()
        );

        newMessage.id = messageRef.id;

        await updateDoc(messageRef, { id: newMessage.id });
      }
    });
  }

  async updateMessage(message: ChannelMessage) {
    if (message.id) {
      let docRef = this.getSingleMessageRef(message.id);
      await updateDoc(docRef, message.getMessageJson()).catch((err) => {
        console.log(err);
      });
    }
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
      this.getMessagesRef(),
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

  getMessagesRef() {
    return collection(
      this.firestore,
      `channels/${this.channelService.channelID}/messages`
    );
  }

  getSingleMessageRef(docId: string) {
    return doc(
      collection(
        this.firestore,
        `channels/${this.channelService.channelID}/messages`
      ),
      docId
    );
  }

  ngOnDestroy() {
    this.unsubMessages();
  }
}
