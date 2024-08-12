import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection } from '@angular/fire/firestore';
import { Thread } from '../../models/thread.class';
import { ChannelMessage } from '../../models/channel.class';
import { ChannelMessageService } from './channel-message.service';

@Injectable({
  providedIn: 'root',
})
export class ThreadService {
  threadID?: string = '';

  constructor(
    private firestore: Firestore,
    private channelMessageService: ChannelMessageService
  ) {}

  async addThread(name: string) {
    let selectedMessage: ChannelMessage | null = null;

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

  getThreadsRef() {
    return collection(this.firestore, 'threads');
  }
}
