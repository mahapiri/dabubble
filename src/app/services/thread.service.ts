import { Injectable } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  updateDoc,
} from '@angular/fire/firestore';
import { Thread } from '../../models/thread.class';
import { ChannelMessageService } from './channel-message.service';
import { Subscription } from 'rxjs';
import { ChannelService } from './channel.service';

@Injectable({
  providedIn: 'root',
})
export class ThreadService {
  threadID?: string = '';

  private channelMessageSubscription: Subscription = new Subscription();
  private channelNameSubscription: Subscription = new Subscription();

  constructor(
    private firestore: Firestore,
    private channelService: ChannelService,
    private channelMessageService: ChannelMessageService
  ) {}

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
                  }
                }
              );
          }
        }
      );
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
    //this.messagesSubscription.unsubscribe();
  }
}
