import { Injectable } from '@angular/core';
import {
  Firestore,
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
import { BehaviorSubject, Subscription, take } from 'rxjs';
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
  private unsubSelectedThreads?: () => void;
  private unsubThreads!: () => void;

  constructor(
    private firestore: Firestore,
    private channelService: ChannelService,
    private channelMessageService: ChannelMessageService
  ) {
    this.unsubThreads = this.subThreadList();
  }

  async addThread() {
    this.channelMessageSubscription =
      this.channelMessageService.selectedChannelMessage$
        .pipe(take(1))
        .subscribe(async (selectedMessage) => {
          if (selectedMessage) {
            const messageJson = selectedMessage.getMessageJson();

            const existingThread = await this.findThreadByMessageId(
              messageJson.id
            );

            if (existingThread) {
              const thread = existingThread.docs[0];
              this.threadID = thread.id;
              console.log('Thread existiert bereits:', this.threadID);
              if (this.unsubSelectedThreads) {
                this.unsubSelectedThreads(); // Vorheriges Abonnement beenden
              }
              this.unsubSelectedThreads = this.subSelectedThread(this.threadID);
            } else {
              this.channelNameSubscription =
                this.channelService.selectedChannel$
                  .pipe(take(1))
                  .subscribe(async (selectedChannel) => {
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
                      if (this.unsubSelectedThreads) {
                        this.unsubSelectedThreads(); // Vorheriges Abonnement beenden
                      }
                      this.unsubSelectedThreads = this.subSelectedThread(
                        this.threadID
                      );
                    }
                  });
            }
          }
        });
  }

  /**
   * Checks if a Thread already exists for the clicked Message. Searches for a thread collection that contains the given MessageID.
   * @param messageId ID of the message
   * @returns a promise with the thread that contains the given message ID in their `replyToMessage` array.
   */
  async findThreadByMessageId(messageId: string) {
    const q = query(
      this.getThreadsRef(),
      where('replyToMessage.id', '==', messageId)
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot;
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

  ngOnDestroy(): void {
    this.channelMessageSubscription.unsubscribe();
    this.channelNameSubscription.unsubscribe();
    if (this.unsubSelectedThreads) {
      this.unsubSelectedThreads();
    }
    if (this.unsubThreads) {
      this.unsubThreads();
    }
  }
}
