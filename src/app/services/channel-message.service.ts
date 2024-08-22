import { Injectable } from '@angular/core';
import {
  Firestore,
  Unsubscribe,
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
import { BehaviorSubject, Subscription } from 'rxjs';
import { query } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class ChannelMessageService {
  private channelMessagesSubjects = new BehaviorSubject<ChannelMessage[]>([]);
  channelMessages$ = this.channelMessagesSubjects.asObservable();

  private selectedChannelMessage = new BehaviorSubject<ChannelMessage | null>(
    null
  );
  selectedChannelMessage$ = this.selectedChannelMessage.asObservable();

  previousDate: string | null = null;

  channelMessages: ChannelMessage[] = [];
  selectedChannel: Subscription;
  public messageListUnsubscribe: Unsubscribe | undefined;

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
    this.selectedChannel = this.channelService.selectedChannel$.subscribe(
      (channel) => {
        if (channel) {
          this.channelService.setChannelId(channel);
          this.subMessageList();
        }
      }
    );
  }

  /**
   * Sets the selected message, when clicked to answer.
   * @param message The selected message
   */
  setSelectedMessage(selectedMessage: ChannelMessage | null) {
    this.selectedChannelMessage.next(selectedMessage);
  }

  /**
   * Adds a new message to the current channel by subscribing to the current user and adding it to the Firestore.
   * Its ID is stored in the object.
   * @param {string} text - Content of the message.
   * @returns {Promise<void>} - A promise that resolves when the message has been added and its ID has been updated.
   */
  async addMessage(text: string): Promise<void> {
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

  /**
   * Updates an existing message and its contents in the database.
   * @param {ChannelMessage} message - The message object.
   * @returns {Promise<void>} - A promise that resolves when the message has been updated.
   */
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

    this.messageListUnsubscribe = onSnapshot(q, (list) => {
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

  /**
   * Creates a new `ChannelMessage` object from the provided data.
   * @param {string} id - id of the message.
   * @param {any} data - object with the message data, including text, time, date, author information, etc.
   * @returns {ChannelMessage} - A new `ChannelMessage` object with the provided data.
   */
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

  /**
   * Creates a new `ChannelMessage` object using the provided text and user information.
   * This method generates the current date and time, then constructs a `ChannelMessage`
   * instance with the given text and the user's details, such as username, user ID, and profile image.
   * @param {string} text - The content of the message
   * @param {User} user - The user object with the info about the message author
   * @returns {ChannelMessage} - A new `ChannelMessage` object with the provided text, user information, and the current date and time.
   */
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

  /**
   * Gets a reference to the firestore messages collection for the currently selected channel.
   * @returns {CollectionReference} - reference to the Firestore collection
   */
  getMessagesRef() {
    return collection(
      this.firestore,
      `channels/${this.channelService.channelID}/messages`
    );
  }

  /**
   * Gets the reference to a specific message document in the firesore messages collection.
   * @param {string} docId - the message document
   * @returns {DocumentReference} - reference to the Firestore document
   */
  getSingleMessageRef(docId: string) {
    return doc(
      collection(
        this.firestore,
        `channels/${this.channelService.channelID}/messages`
      ),
      docId
    );
  }

  /**
   * Unsubscribes from the messages listener.
   */
  ngOnDestroy() {
    this.selectedChannel.unsubscribe();
  }
}
