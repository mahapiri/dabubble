import { Injectable } from '@angular/core';
import { Thread, ThreadMessage } from '../../models/thread.class';
import { ChatService } from './chat.service';
import {
  Firestore,
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from '@angular/fire/firestore';
import { UserService } from './user.service';
import { ThreadService } from './thread.service';
import { User } from '../../models/user.class';
import {
  BehaviorSubject,
  Observable,
  Subscription,
  map,
  of,
  switchMap,
} from 'rxjs';
import { ChannelMessage } from '../../models/channel.class';

@Injectable({
  providedIn: 'root',
})
export class ThreadMessageService {
  private threadMessagesSubjects = new BehaviorSubject<ThreadMessage[]>([]);
  threadMessages$ = this.threadMessagesSubjects.asObservable();

  threads: Thread[] = [];
  threadMessages: ThreadMessage[] = [];

  previousDate: string | null = null;

  unsubThreadMessages!: () => void;
  unsubUser!: Subscription;
  selectedThreadSubscription: Subscription;

  constructor(
    private firestore: Firestore,
    private chatService: ChatService,
    private userService: UserService,
    private threadService: ThreadService
  ) {
    this.selectedThreadSubscription =
      this.threadService.selectedThread$.subscribe((thread) => {
        if (thread) {
          this.unsubThreadMessages = this.subThreadMessageList();
        }
      });
  }

  /**
   * Adds a new message to the current thread by subscribing to the current user and adding it to the Firestore.
   * Its ID is stored in the object.
   * @param {string} text - Content of the message.
   * @returns {Promise<void>} - A promise that resolves when the message has been added and its ID has been updated.
   */
  async addThreadMessage(text: string): Promise<void> {
    this.unsubUser = this.userService.currentUser$.subscribe(
      async (currentUser) => {
        if (currentUser) {
          const newMessage: ThreadMessage = this.setMessageWithUser(
            text,
            currentUser
          );
          const messageRef = await addDoc(
            this.getThreadMessagesRef(),
            newMessage.getMessageJson()
          );
          newMessage.id = messageRef.id;
          await updateDoc(messageRef, { id: newMessage.id });
        }
      }
    );
  }

  /**
   * Subscribes to changes in the messages collection of the currently selected thread.
   * Fetches the latest list of messages and updates the threadMessagesSubjects BehaviorSubject.
   * Orders the messages by the "date" and "time" they are written in ascending order first to be able to call the isFirstMessageOfDay Function to determine which message is the first one of the day.
   * Then reverses the Order, so older messages are shown higher up in the chat and the latest messages are shown at the bottom.
   * @returns - the unsubscribe function for the onSnapshot listener.
   */
  subThreadMessageList() {
    this.threadMessages = [];

    const q = query(
      this.getThreadMessagesRef(),
      orderBy('date', 'asc'),
      orderBy('time', 'asc'),
      limit(20)
    );

    return onSnapshot(q, (list) => {
      this.threadMessages = [];
      this.previousDate = null;

      list.forEach((message) => {
        const currentMessage = this.setMessageObject(
          message.id,
          message.data()
        );
        this.chatService.setFirstMessageOfDay(currentMessage);
        this.threadMessages.push(currentMessage);
      });

      this.threadMessages.reverse();
      this.threadMessagesSubjects.next(this.threadMessages);
      console.log('Message received:', this.threadMessages);
    });
  }

  /**
   * Creates a new `ThreadMessage` object from the provided data.
   * @param {string} id - id of the message.
   * @param {any} data - object with the message data, including text, time, date, author information, etc.
   * @returns {ThreadMessage} - A new `ThreadMessage` object with the provided data.
   */
  setMessageObject(id: string, data: any): ThreadMessage {
    return new ThreadMessage({
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

  /*   /**
   * Zählt die Nachrichten in einem bestimmten Thread basierend auf der Thread-ID.
   * @param threadId - Die ID des Threads, dessen Nachrichten gezählt werden sollen.
   * @returns Die Anzahl der Nachrichten im Thread.
   
  async getThreadMessageCountById(threadId: string): Promise<number> {
    const threadMessagesRef = collection(
      this.firestore,
      `threads/${threadId}/messages`
    );
    const threadMessagesSnapshot = await getDocs(threadMessagesRef);
    return threadMessagesSnapshot.size;
  } 
  */

  /* getThreadMessageCount(channelMessage: ChannelMessage): Observable<number> {
    return this.threadService.selectedThread$.pipe(
      // Wenn sich der Thread ändert, führe den nächsten Block aus
      switchMap((thread) => {
        if (thread && thread.replyToMessage?.id === channelMessage.id) {
          // Falls der Thread existiert, überwache die Nachrichten
          return this.threadMessageService.threadMessages$.pipe(
            map((threadMessages) => {
              console.log('Filtered Messages Array:', threadMessages);
              console.log('Filtered Messages Length:', threadMessages.length);
              return threadMessages.length;
            })
          );
        } else {
          // Wenn kein Thread existiert oder die IDs nicht übereinstimmen
          return of(0);
        }
      })
    );
  } */

  /* getThreadMessageCount(): number {
    let threadMessageCount = 0;

    this.selectedThreadSubscription =
      this.threadService.selectedThread$.subscribe((thread) => {
        if (thread) {
          this.unsubThreadMessages = this.subThreadMessageList();
          this.threadMessages$.subscribe((threadMessages) => {
            threadMessageCount = threadMessages.length;
            console.log('ThreadMessages Array:', threadMessages);
            console.log('ThreadMessages Length:', threadMessageCount);
          });
        }
      });

    return threadMessageCount;
  } */

  getThreadMessagesRef() {
    return collection(
      this.firestore,
      `threads/${this.threadService.threadID}/messages`
    );
  }

  ngOnDestroy(): void {
    this.selectedThreadSubscription.unsubscribe();
    this.unsubUser.unsubscribe();
    this.unsubThreadMessages();
  }
}
