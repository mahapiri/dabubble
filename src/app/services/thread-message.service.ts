import { Injectable } from '@angular/core';
import { Thread, ThreadMessage } from '../../models/thread.class';
import { ChatService } from './chat.service';
import {
  Firestore,
  addDoc,
  collection,
  updateDoc,
} from '@angular/fire/firestore';
import { UserService } from './user.service';
import { ChannelService } from './channel.service';
import { ThreadService } from './thread.service';
import { User } from '../../models/user.class';

@Injectable({
  providedIn: 'root',
})
export class ThreadMessageService {
  threads: Thread[] = [];

  unsubMessages!: () => void;
  unsubUser: any;

  constructor(
    private firestore: Firestore,
    private chatService: ChatService,
    private userService: UserService,
    private channelService: ChannelService,
    private threadService: ThreadService
  ) {}

  /**
   * Adds a new message to the current thread by subscribing to the current user and adding it to the Firestore.
   * Its ID is stored in the object.
   * @param {string} text - Content of the message.
   * @returns {Promise<void>} - A promise that resolves when the message has been added and its ID has been updated.
   */
  async addThreadMessage(text: string) {
    this.unsubUser = this.userService.currentUser$.subscribe(
      async (currentUser) => {
        if (currentUser) {
          const newMessage: ThreadMessage = this.setMessageWithUser(
            text,
            currentUser
          );
          const messageRef = await addDoc(
            this.getThreadMessageRef(),
            newMessage.getMessageJson()
          );
          newMessage.id = messageRef.id;
          await updateDoc(messageRef, { id: newMessage.id });
          console.log('new ThreadMessage added to Firestore:', newMessage);
        }
      }
    );
  }

  /**
   * Creates a new `ThreadMessage` object using the provided text and user information.
   * This method generates the current date and time, then constructs a `ThreadMessage`
   * instance with the given text and the user's details, such as username, user ID, and profile image.
   * @param {string} text - The content of the message
   * @param {User} user - The user object with the info about the message author
   * @returns {ThreadMessage} - A new 'ThreadMessage' object with the provided text, user information, and the current date and time.
   */
  setMessageWithUser(text: string, user: User): ThreadMessage {
    const now = new Date();

    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };

    return new ThreadMessage({
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

  getThreadMessageRef() {
    return collection(
      this.firestore,
      `threads/${this.threadService.threadID}/messages`
    );
  }

  ngOnDestroy(): void {
    this.unsubUser();
  }
}
