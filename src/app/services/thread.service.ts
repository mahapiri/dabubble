import { Injectable } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  doc,
  onSnapshot,
  updateDoc,
} from '@angular/fire/firestore';
import { Thread } from '../../models/thread.class';
import { ChannelMessageService } from './channel-message.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ChannelService } from './channel.service';

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

  private channelMessageSubscription: Subscription = new Subscription();
  private channelNameSubscription: Subscription = new Subscription();
  private selectedThreadsSubscription: Subscription = new Subscription();

  unsubThreads!: () => void;

  constructor(
    private firestore: Firestore,
    private channelService: ChannelService,
    private channelMessageService: ChannelMessageService
  ) {
    this.unsubThreads = this.subThreadList();
  }

  async addThread() {
    this.channelMessageSubscription =
      this.channelMessageService.selectedChannelMessage$.subscribe(
        async (selectedMessage) => {
          if (selectedMessage) {
            const messageJson = selectedMessage.getMessageJson();

            this.channelNameSubscription =
              this.channelService.selectedChannel$.subscribe(
                async (selectedChannel) => {
                  if (selectedChannel) {
                    const channelName = selectedChannel.channelName;
                    const newThread: Thread = this.setThreadObject(
                      messageJson,
                      channelName
                    );
                    const threadsRef = await addDoc(
                      this.getThreadsRef(),
                      newThread.getThreadJson()
                    );

                    this.threadID = threadsRef.id;
                    await updateDoc(threadsRef, { threadID: threadsRef.id });
                    console.log('new Thread created:', newThread);
                    this.setSelectedThread(this.threadID);
                  }
                }
              );
          }
        }
      );
  }

  setSelectedThread(threadID: string) {
    if (threadID != undefined) {
      onSnapshot(doc(this.firestore, 'threads', threadID), (doc) => {
        this.selectedThread.next(new Thread(doc.data()));
      });
    }
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

  setThreadObject(messageJson: any, channelName: string): Thread {
    return new Thread({
      threadID: this.threadID || '',
      channelName: channelName || '',
      replyToMessage: [messageJson],
    });
  }

  getThreadsRef() {
    return collection(this.firestore, 'threads');
  }

  ngOnDestroy(): void {
    this.channelMessageSubscription.unsubscribe();
    this.channelNameSubscription.unsubscribe();
    this.unsubThreads();
  }
}
