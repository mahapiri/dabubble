import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection } from '@angular/fire/firestore';
import { Thread } from '../../models/thread.class';
import { BehaviorSubject } from 'rxjs';
import { ChannelMessage } from '../../models/channel.class';

@Injectable({
  providedIn: 'root',
})
export class ThreadService {
  private selectedChannelMessage = new BehaviorSubject<ChannelMessage | null>(
    null
  );
  selectedMessage$ = this.selectedChannelMessage.asObservable();

  threadID?: string = '';

  constructor(private firestore: Firestore) {}

  async addThread(name: string) {
    const selectedMessage = this.selectedChannelMessage.getValue();

    if (selectedMessage) {
      const newThread: Thread = this.setThreadObject(name, selectedMessage);
      const threadsRef = await addDoc(
        this.getThreadsRef(),
        newThread.getThreadJson()
      );

      this.threadID = threadsRef.id;
    }
  }

  setThreadObject(name: string, message: ChannelMessage): Thread {
    return new Thread({
      threadID: this.threadID || '',
      channelName: name,
      replyToMessage: [message],
    });
  }

  setSelectedMessage(message: ChannelMessage) {
    this.selectedChannelMessage.next(message);
  }

  getThreadsRef() {
    return collection(this.firestore, 'threads');
  }
}
