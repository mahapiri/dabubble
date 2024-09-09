import { Injectable } from '@angular/core';
import {
  Firestore,
  QuerySnapshot,
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Thread, replyToMessage } from '../../models/thread.class';
import { ChannelMessageService } from './channel-message.service';
import { BehaviorSubject, Subscription, firstValueFrom, take } from 'rxjs';
import { ChannelService } from './channel.service';
import { Channel, ChannelMessage } from '../../models/channel.class';

@Injectable({
  providedIn: 'root',
})
export class ThreadService {
  threadID?: string = '';
  threads: Thread[] = [];

  private threadsSubject = new BehaviorSubject<Thread[]>([]);
  threads$ = this.threadsSubject.asObservable();

  public selectedThread = new BehaviorSubject<Thread | null>(null);
  selectedThread$ = this.selectedThread.asObservable();

  private subscription: Subscription = new Subscription();

  constructor(
    private firestore: Firestore,
    private channelService: ChannelService,
    private channelMessageService: ChannelMessageService
  ) {
    this.subscription.add(this.subThreadList());

    this.subscription.add(
      this.selectedThread$.subscribe((thread) => {
        this.threadID = thread?.threadID;
      })
    );
  }

  /**
   * Handles the thread: Opens an existing one or creates a new one based on the selected message.
   * Retrieves the selected message and checks if a thread exists for the selected message by its ID.
   * If an existing thread is found, initates opening it. If not, initiates a thread creation.
   */
  async handleThread() {
    const selectedMessage = await this.getSelectedChannelMessage();
    const existingThread = await this.findThreadByMessageId(
      selectedMessage!.id
    );

    existingThread
      ? this.handleExistingThread(existingThread)
      : await this.handleNewThread(selectedMessage!);
  }

  /**
   * Retrieves the currently selected ChannelMessage by listening to the Observable.
   * @returns {Promise<ChannelMessage | null>} A promise that resolves with the selected channel message or null
   */
  async getSelectedChannelMessage(): Promise<ChannelMessage | null> {
    return firstValueFrom(
      this.channelMessageService.selectedChannelMessage$.pipe(take(1))
    );
  }

  /**
   * Retrieves the currently selected Channel by listening to the Observable.
   * @returns {Promise<Channel | null>} A promise that resolves with the selected channel or null
   */
  async getSelectedChannel(): Promise<Channel | null> {
    return firstValueFrom(this.channelService.selectedChannel$.pipe(take(1)));
  }

  /**
   * Checks if a thread already exists by extracting the thread ID from the provided `QuerySnapshot`.
   * If a thread is found, it updates the `threadID` property and subscribes to updates for that specific thread.
   * @param {QuerySnapshot} existingThread - A Firestore query snapshot that contains the existing thread.
   */
  handleExistingThread(existingThread: QuerySnapshot) {
    this.threadID = this.getThreadIdFromSnapshot(existingThread);
    if (this.threadID) {
      console.log('Thread existiert bereits:', this.threadID);
      this.subscription.add(this.subSelectedThread(this.threadID!));
    }
  }

  /**
   * Retrieves the thread ID from the first document in the provided query snapshot.
   * @param existingThread A Firestore query snapshot that contains the documents of the existing thread.
   * @returns The ID of the first thread in the snapshot
   */
  getThreadIdFromSnapshot(existingThread: QuerySnapshot) {
    return existingThread.docs[0].id;
  }

  /**
   * Handles the creation of a new thread for the provided message.
   * Retrieves the currently selected channel, then creates new thread
   * @param selectedMessage
   */
  async handleNewThread(selectedMessage: ChannelMessage) {
    const selectedChannel = await this.getSelectedChannel();
    await this.createNewThread(selectedChannel!.channelName, selectedMessage);
  }

  /**
   * Constructs a new thread object and adds it to the Firestore database. Updates the thread with its ID, and sets up a subscription for real-time updates on this new thread.
   * @param {string} channelName - channel where the new thread belongs to
   * @param {any} messageJson - The JSON of the message with the new thread.
   * @returns {Promise<void>} - A promise that resolves when the new thread has been successfully created and updated.
   */
  private async createNewThread(
    channelName: string,
    messageJson: any
  ): Promise<void> {
    const newThread: Thread = this.setThreadObject(channelName, messageJson);
    const threadsRef = await addDoc(
      this.getThreadsRef(),
      newThread.getThreadJson()
    );

    this.threadID = threadsRef.id;
    this.addThreadIdToThread(threadsRef);
    console.log('New Thread created:', newThread);
    this.subscription.add(this.subSelectedThread(this.threadID!));
  }

  /** Updates the Thread by adding the Id to the Thread Object in the Firestore */
  async addThreadIdToThread(threadsRef: any) {
    await updateDoc(threadsRef, { threadID: threadsRef.id });
  }

  /**
   * Checks if a Thread already exists for the clicked Message. Searches for a thread collection that contains the given MessageID.
   * @param messageId ID of the message
   * @returns the existing thread or null if no thread exists with that message Id.
   */
  async findThreadByMessageId(messageId: string) {
    const q = query(
      this.getThreadsRef(),
      where('replyToMessage.id', '==', messageId)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty ? querySnapshot : null;
  }

  /**
   * Subscribes to real-time updates for the selected thread in the Firestore database.
   * @param {string} threadID ID of the thread
   * @returns {Function} - A function that, when called, unsubscribes from the real-time updates for the thread.
   */
  subSelectedThread(threadID: string) {
    return onSnapshot(this.getSingleThreadRef(threadID), (doc) => {
      this.selectedThread.next(new Thread(doc.data()));
    });
  }

  /**
   * Subscribes to real-time updates for the list of threads in the Firestore database.
   * @returns  {Function} - A function that, when called, unsubscribes from the real-time updates for the threads collection.
   */
  subThreadList() {
    return onSnapshot(this.getThreadsRef(), (list) => {
      this.threads = [];
      list.forEach((thread) => {
        const currentThread = this.setThreadObject(
          thread.data()['channelName'],
          undefined,
          thread.id,
          thread.data()
        );
        this.threads.push(currentThread);
      });
      this.threadsSubject.next(this.threads);
    });
  }

  /**
   * Updates the `replyToMessage` field in the thread object associated with a given message.
   * Hands over the message Object to be updated. Checks, if a thread exists for this message. If yes, updates the message Object in the replyToMessage field of this thread document.
   * @param {ChannelMessage} message - The message object with the updated info.
   */
  async updateReplyToMesageInThreadObject(message: ChannelMessage) {
    const existingThread = await this.findThreadByMessageId(message.id);
    if (existingThread) {
      this.threadID = this.getThreadIdFromSnapshot(existingThread);
      let threadRef = this.getSingleThreadRef(this.threadID);
      await updateDoc(threadRef, {
        replyToMessage: message.getMessageJson(),
      }).catch((err) => {
        console.log(err);
      });
      console.log('Thread updated:', this.threads);
    }
  }

  /**
   * Creates a new `Thread` object with the given data.
   * @param channelName The name of the channel of the thread
   * @param messageJson Optional - The JSON of the message, used to create a `replyToMessage`
   * @param threadID Optional - The ID of the thread, if available
   * @returns {Thread} - A new `Thread` instance
   */
  setThreadObject(
    channelName: string,
    messageJson?: any,
    threadID: string = '',
    threadData?: any
  ): Thread {
    return new Thread({
      threadID: threadID,
      channelName: channelName,
      replyToMessage: messageJson
        ? new replyToMessage(messageJson)
        : threadData?.['replyToMessage']
        ? new replyToMessage(threadData['replyToMessage'])
        : undefined,
    });
  }

  /**
   * Retrieves and returns a reference to the `threads` collection in Firestore.
   */
  getThreadsRef() {
    return collection(this.firestore, 'threads');
  }

  /**
   * Retrieves and returns the reference to a specific thread document in the firesore threads collection.
   * @param {string} docId - the thread document
   */
  getSingleThreadRef(docId: string) {
    return doc(collection(this.firestore, 'threads'), docId);
  }

  /**
   * Cleans up subscriptions when the service is destroyed.
   */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
