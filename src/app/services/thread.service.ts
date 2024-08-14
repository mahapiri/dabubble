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
import { Thread } from '../../models/thread.class';
import { ChannelMessageService } from './channel-message.service';
import { BehaviorSubject, Observable, firstValueFrom, take } from 'rxjs';
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

  private selectedThread = new BehaviorSubject<Thread | null>(null);
  selectedThread$ = this.selectedThread.asObservable();

  private unsubSelectedThreads?: () => void;
  private unsubThreads!: () => void;

  constructor(
    private firestore: Firestore,
    private channelService: ChannelService,
    private channelMessageService: ChannelMessageService
  ) {
    this.unsubThreads = this.subThreadList();
  }

  async handleThread() {
    const selectedMessage = await this.getSelectedChannelMessage();

    const existingThread = await this.findThreadByMessageId(
      selectedMessage!.id
    );

    existingThread
      ? this.openExistingThread(existingThread)
      : await this.handleNewThread(selectedMessage!);
  }

  // Holt die ausgewählte Nachricht
  async getSelectedChannelMessage(): Promise<ChannelMessage | null> {
    return firstValueFrom(
      this.channelMessageService.selectedChannelMessage$.pipe(take(1))
    );
  }

  // Holt den ausgewählten Kanal
  async getSelectedChannel(): Promise<Channel | null> {
    return firstValueFrom(this.channelService.selectedChannel$.pipe(take(1)));
  }

  // Existiert ein Thread bereits wird dieser geöffnet
  openExistingThread(existingThread: QuerySnapshot) {
    this.threadID = this.getThreadIdFromSnapshot(existingThread);
    console.log('Thread existiert bereits:', this.threadID);
    this.unsubSelectedThreads = this.subSelectedThread(this.threadID!);
  }

  getThreadIdFromSnapshot(existingThread: QuerySnapshot) {
    return existingThread.docs[0].id;
  }

  async handleNewThread(selectedMessage: ChannelMessage) {
    const selectedChannel = await this.getSelectedChannel();
    await this.createNewThread(selectedChannel!.channelName, selectedMessage);
  }

  // Erstellt einen neuen Thread
  private async createNewThread(channelName: string, messageJson: any) {
    const newThread: Thread = this.setThreadObject(messageJson, channelName);
    const threadsRef = await addDoc(
      this.getThreadsRef(),
      newThread.getThreadJson()
    );

    this.threadID = threadsRef.id;
    await updateDoc(threadsRef, { threadID: threadsRef.id });
    console.log('New Thread created:', newThread);
    this.unsubSelectedThreads = this.subSelectedThread(this.threadID);
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

  subSelectedThread(threadID: string) {
    return onSnapshot(doc(this.firestore, 'threads', threadID), (doc) => {
      this.selectedThread.next(new Thread(doc.data()));
    });
  }

  subThreadList() {
    return onSnapshot(this.getThreadsRef(), (list) => {
      this.threads = [];
      list.forEach((thread) => {
        const currentThread = this.setThreadObject(thread.data(), thread.id);
        this.threads.push(currentThread);
      });
      this.threadsSubject.next(this.threads);
      console.log('Thread received:', this.threads);
    });
  }

  async updateReplyToMesageInThreadObject(message: ChannelMessage) {
    // übergibt das geänderte Message Objekt
    // checken, ob zu dieser Message ein Thread besteht
    // falls ja, dann gehe in den Thread mit der id und update Feld "replyToMessage" mit dem message Objekt.
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

  setThreadObject(messageJson: any, channelName: string): Thread {
    return new Thread({
      threadID: this.threadID || '',
      channelName: channelName || '',
      replyToMessage: messageJson,
    });
  }

  getThreadsRef() {
    return collection(this.firestore, 'threads');
  }

  /**
   * Gets the reference to a specific thread document in the firesore threads collection.
   * @param {string} docId - the thread document
   * @returns {DocumentReference} - reference to the Firestore document
   */
  getSingleThreadRef(docId: string) {
    return doc(collection(this.firestore, 'threads'), docId);
  }

  ngOnDestroy(): void {
    if (this.unsubSelectedThreads) {
      this.unsubSelectedThreads();
    }
    if (this.unsubThreads) {
      this.unsubThreads();
    }
  }
}
