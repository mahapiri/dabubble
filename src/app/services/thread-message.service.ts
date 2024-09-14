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

  private userSubscription!: Subscription;
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

  /**
   * Retrieves and subscribes to the count of answers for a thread.
   */
  getAnswerCount() {
    const msgRef = this.getThreadMessagesRef();
    this.subscribeToAnswerCount(msgRef, this.updateAnswerCount.bind(this));
  }

  /**
   * Retrieves the answer count for a specific channel message and returns it as an observable.
   * 1. Finds the thread associated with the given message ID by calling `findThreadByMessageId` from `threadService`.
   * 2. If an existing thread is found, it retrieves the thread ID from the thread snapshot.
   * 3. It then creates a reference to the `messages` subcollection of the thread in Firestore.
   * 4. Subscribes to updates on the answer count in this collection and emits the count through the observable.
   * @param {string} chMsgId - The ID of the channel message for which to retrieve the answer count.
   * @returns {Observable<number>} An `Observable` that emits the answer count as a number when updates are available.
   */
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

  /**
   * Retrieves the last answer for a specific channel message and returns it as an observable.
   * @param {string} chMsgId - The ID of the channel message for which to retrieve the last answer.
   * @returns {Observable<string>} An `Observable` that emits the last answer as a string when updates are available.
   */
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

  /**
   * Subscribes to updates on the last answer in a collection and emits the latest answer time.
   * @param {CollectionReference} msgRef - A Firestore `CollectionReference` pointing to the messages collection.
   * @param {Subject<string>} lastAnswerSubject - A subject that will receive the latest answer time as a string.
   * @returns {Function} A function that can be called to unsubscribe from the real-time updates.
   */
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

  /**
   * Subscribes to updates on the answer count in a collection and invokes a callback with the latest count.
   * @param {CollectionReference} msgRef - A Firestore `CollectionReference` pointing to the collection for which the answer count is tracked.
   * @param {(count: number) void} callback - A function to be called with the updated answer count each time it changes.
   * @returns {Function} A function that can be called to unsubscribe from the real-time updates.
   */
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

  /**
   * Updates the answer count and emits the new value through a subject.
   * @param {number} count - The new answer count.
   */
  updateAnswerCount(count: number) {
    this.answerCountSubject.next(count);
  }

  /**
   * Adds a new message to the current thread by subscribing to the current user and adding it to the Firestore. Its ID is stored in the object.
   * @param {string} text - Content of the message.
   * @returns {Promise<void>} - A promise that resolves when the message has been added and its ID has been updated.
   */
  async addThreadMessage(text: string, fileUrl: string): Promise<void> {
    this.userSubscription = this.userService.currentUser$.subscribe(
      async (currentUser) => {
        if (currentUser) {
          const newMessage: ThreadMessage = this.setMessageWithUser(
            text,
            fileUrl,
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
    this.userSubscription.unsubscribe();
  }

  /**
   * Subscribes to changes in the messages collection of the currently selected thread.
   * Fetches the latest list of messages and updates the threadMessagesSubjects BehaviorSubject.
   * @returns - the unsubscribe function for the onSnapshot listener.
   */
  getThreadMessageList(): Promise<void> {
    this.threadMessages = [];

    const q = query(
      this.getThreadMessagesRef(),
      orderBy('date', 'asc'),
      orderBy('time', 'asc'),
      limit(1000)
    );

    return new Promise((resolve) => {
      const unsubscribe = onSnapshot(q, (list) => {
        this.threadMessages = [];
        list.forEach((message) => {
          const currentMessage = this.setMessageObject(
            message.id,
            message.data()
          );
          this.chatService.setFirstMessageOfDay(currentMessage);
          this.threadMessages.push(currentMessage);
        });
        this.threadMessagesSubjects.next(this.threadMessages);
        resolve();
      });
      return unsubscribe;
    });
  }

  /**
   * Updates a thread message in the Firestore database.
   * @param {ThreadMessage} threadMessage - The `ThreadMessage` object containing the data to update. */
  async updateMessage(threadMessage: ThreadMessage) {
    if (threadMessage.id) {
      let docRef = this.getSingleThreadMessageRef(threadMessage.id);
      await updateDoc(docRef, threadMessage.getMessageJson()).catch(
        (err) => {}
      );
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
      file: data['file'],
      isFirstMessageOfDay: false,
    });
  }

  /**
   * Creates a new `ThreadMessage` object using the provided text and user information.
   * @param {string} text - The content of the message
   * @param {User} user - The user object with the info about the message author
   * @returns {ThreadMessage} - A new 'ThreadMessage' object with the provided text, user information, and the current date and time.
   */
  setMessageWithUser(text: string, fileUrl: string, user: User): ThreadMessage {
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
      file: fileUrl,
      isFirstMessageOfDay: false,
    });
  }

  /**
   * Retrieves a reference to the collection of messages for the current thread.
   * @returns {CollectionReference} A Firestore `CollectionReference` pointing to the `messages` subcollection of the current thread.
   */
  getThreadMessagesRef(): CollectionReference {
    return collection(
      this.firestore,
      `threads/${this.threadService.threadID}/messages`
    );
  }

  /**
   * Retrieves a reference to a specific message document within the current thread's messages collection.
   * @param {string} docId - The ID of the message document to reference.
   * @returns {DocumentReference} A Firestore `DocumentReference` pointing to the specified message document within the current thread's messages collection.
   */
  getSingleThreadMessageRef(docId: string): DocumentReference {
    return doc(
      collection(
        this.firestore,
        `threads/${this.threadService.threadID}/messages`
      ),
      docId
    );
  }

  /** Cleans up subscriptions when the component is destroyed. */
  ngOnDestroy(): void {
    this.selectedThread.unsubscribe();
  }
}
