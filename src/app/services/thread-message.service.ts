import { Injectable } from '@angular/core';
import { Thread, ThreadMessage } from '../../models/thread.class';
import { ChatService } from './chat.service';
import {
  CollectionReference,
  DocumentReference,
  Firestore,
  addDoc,
  collection,
  doc,
  getCountFromServer,
  limit,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from '@angular/fire/firestore';
import { UserService } from './user.service';
import { ThreadService } from './thread.service';
import { User } from '../../models/user.class';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThreadMessageService {
  private threadMessagesSubjects = new BehaviorSubject<ThreadMessage[]>([]);
  threadMessages$ = this.threadMessagesSubjects.asObservable();

  private answerCountSubject = new BehaviorSubject<number>(0);
  public answerCount$ = this.answerCountSubject.asObservable();

  private lastAnswerSubject = new BehaviorSubject<string>('');
  public lastAnswer$ = this.lastAnswerSubject.asObservable();

  threads: Thread[] = [];
  threadMessages: ThreadMessage[] = [];

  //previousDate: string | null = null;

  unsubUser!: Subscription;
  selectedThread: Subscription;

  constructor(
    private firestore: Firestore,
    private chatService: ChatService,
    private userService: UserService,
    private threadService: ThreadService
  ) {
    this.selectedThread = this.threadService.selectedThread$.subscribe(
      async () => {
        await this.getThreadMessageList();
        this.getAnswerCount();
      }
    );
  }

  getAnswerCount() {
    const msgRef = this.getThreadMessagesRef();
    this.subscribeToAnswerCount(msgRef, this.updateAnswerCount.bind(this));
  }

  getAnswerCountForChannelMessage(chMsgId: string): Observable<number> {
    return new Observable<number>((answerCountSubject) => {
      this.threadService
        .findThreadByMessageId(chMsgId)
        .then((existingThread) => {
          if (existingThread) {
            const threadID =
              this.threadService.getThreadIdFromSnapshot(existingThread);
            const msgRef = collection(
              this.firestore,
              `threads/${threadID}/messages`
            );
            this.subscribeToAnswerCount(
              msgRef,
              answerCountSubject.next.bind(answerCountSubject)
            );
          }
        });
    });
  }

  getLastAnswer(chMsgId: string): Observable<string> {
    return new Observable<string>((lastAnswerSubject) => {
      this.threadService
        .findThreadByMessageId(chMsgId)
        .then((existingThread) => {
          if (existingThread) {
            const threadID =
              this.threadService.getThreadIdFromSnapshot(existingThread);
            const msgRef = collection(
              this.firestore,
              `threads/${threadID}/messages`
            );
            this.subscribeToLastAnswer(msgRef, lastAnswerSubject);
          }
        });
    });
  }

  subscribeToLastAnswer(msgRef: CollectionReference, lastAnswerSubject: any) {
    const q = query(msgRef, orderBy('date', 'desc'), orderBy('time', 'desc'));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (!snapshot.empty) {
        const lastMessage = snapshot.docs[0].data();
        const lastAnswerTime = `${lastMessage['time']}`;
        lastAnswerSubject.next(lastAnswerTime);
      }
    });
    return unsubscribe;
  }

  subscribeToAnswerCount(
    msgRef: CollectionReference,
    callback: (count: number) => void
  ) {
    const unsubscribe = onSnapshot(msgRef, async () => {
      const countSnapshot = await getCountFromServer(msgRef);
      const answerCount = countSnapshot.data().count;
      callback(answerCount);
    });
    return unsubscribe;
  }

  updateAnswerCount(count: number) {
    this.answerCountSubject.next(count);
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
  getThreadMessageList(): Promise<void> {
    this.threadMessages = [];

    const q = query(
      this.getThreadMessagesRef(),
      orderBy('date', 'asc'),
      orderBy('time', 'asc'),
      limit(20)
    );

    return new Promise((resolve) => {
      const unsubscribe = onSnapshot(q, (list) => {
        this.threadMessages = [];
        //this.previousDate = null;

        list.forEach((message) => {
          const currentMessage = this.setMessageObject(
            message.id,
            message.data()
          );
          this.chatService.setFirstMessageOfDay(currentMessage);
          this.threadMessages.push(currentMessage);
        });

        //this.threadMessages.reverse();
        this.threadMessagesSubjects.next(this.threadMessages);
        console.log('Thread Message received:', this.threadMessages);

        resolve();
      });
      return unsubscribe;
    });
  }

  async updateMessage(threadMessage: ThreadMessage) {
    if (threadMessage.id) {
      let docRef = this.getSingleThreadMessageRef(threadMessage.id);
      await updateDoc(docRef, threadMessage.getMessageJson()).catch((err) => {
        console.log(err);
      });
    }
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
      profileImg: data['profileImg'],
      reaction: [],
      file: '',
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
      profileImg: user.profileImage,
      reaction: [],
      file: '',
      isFirstMessageOfDay: false,
    });
  }

  getThreadMessagesRef(): CollectionReference {
    return collection(
      this.firestore,
      `threads/${this.threadService.threadID}/messages`
    );
  }

  getSingleThreadMessageRef(docId: string): DocumentReference {
    return doc(
      collection(
        this.firestore,
        `threads/${this.threadService.threadID}/messages`
      ),
      docId
    );
  }

  ngOnDestroy(): void {
    this.selectedThread.unsubscribe();
    this.unsubUser.unsubscribe();
  }
}
