import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection } from '@angular/fire/firestore';
import { Thread } from '../../models/thread.class';
import { ChannelMessage } from '../../models/channel.class';
import { ChannelMessageService } from './channel-message.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThreadService {
  private threadSubject = new BehaviorSubject<Thread | null>(null);
  thread$ = this.threadSubject.asObservable();

  threadID?: string = '';

  constructor(private firestore: Firestore) {}

  async addThread() {
    let selectedMessage: ChannelMessage | null = null;

    if (selectedMessage) {
      const newThread: Thread = this.setThreadObject(selectedMessage);
      const threadsRef = await addDoc(
        this.getThreadsRef(),
        newThread.getThreadJson()
      );

      this.threadID = threadsRef.id;
      console.log('new Thread created:', newThread);
    }
  }

  setThreadObject(message: ChannelMessage): Thread {
    return new Thread({
      threadID: this.threadID || '',
      channelName: '',
      replyToMessage: [message],
    });
  }

  getThreadsRef() {
    return collection(this.firestore, 'threads');
  }
}
