import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  doc,
  Firestore,
  updateDoc,
  arrayUnion,
  getDoc,
  onSnapshot,
} from '@angular/fire/firestore';
import { UserService } from './user.service';
import { User } from '../../models/user.class';
import { Channel, ChannelMessage } from '../../models/channel.class';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  firestore: Firestore = inject(Firestore);
  userService: UserService = inject(UserService);

  private selectedChannel = new BehaviorSubject<Channel | null>(null);
  selectedChannel$ = this.selectedChannel.asObservable();

  channelID?: string = '';
  createdBy: string = '';

  channelMessages: ChannelMessage[] = [];

  unsubMessages!: () => void;

  cconstructor() {
    /* // Abonniere nur, wenn eine Channel ID gesetzt ist
    this.selectedChannel$.subscribe((channel) => {
      if (channel) {
        this.channelID = channel.channelID;
        if (this.unsubMessages) {
          this.unsubMessages();
        }
        this.unsubMessages = this.subMessageList();
      }
    }); */
  }

  setSelectedChannel(channel: Channel) {
    this.selectedChannel.next(channel);
    this.setChannelId(channel.channelID);
    this.unsubMessages = this.subMessageList(); //muss nachher aus dieser Fkt wieder raus.
  }

  setChannelId(channelID?: string) {
    if (channelID) {
      this.channelID = channelID;
    }
  }

  async addChannel(name: string, description: string, user: User[]) {
    await this.getCreatedByUser();
    const newChannel: Channel = this.setChannelObject(name, description, user);
    const channelRef = await addDoc(
      this.getChannelRef(),
      newChannel.getChannelJson()
    );

    this.channelID = channelRef.id;
    await this.updateChannelWithID(channelRef.id);
    this.userService.updateUserChannels(user, this.channelID);
  }

  async getChannelById(channelID: string) {
    const channelRef = doc(this.firestore, 'channels', channelID);
    const channelDoc = await getDoc(channelRef);
    if (channelDoc.exists()) {
      return new Channel(channelDoc.data());
    } else {
      return undefined;
    }
  }

  async updateChannelWithID(channelID: string) {
    const channelRef = doc(this.firestore, 'channels', channelID);
    await updateDoc(channelRef, { channelID: channelID });
  }

  setChannelObject(
    name: string,
    description: string,
    user: User[],
    channelID?: string
  ): Channel {
    return new Channel({
      channelID: channelID || '',
      channelName: name,
      channelMember: User.convertUsersToJson(user),
      createdBy: this.createdBy,
      description: description,
    });
  }

  async addChannelToContact(userdocId: string, channelId: string) {
    await updateDoc(doc(this.firestore, 'users', userdocId), {
      userChannels: arrayUnion(channelId),
    });
  }

  async getCreatedByUser() {
    let userRef = (
      await getDoc(doc(this.firestore, 'users', this.userService.userID))
    ).data();
    if (userRef) {
      this.createdBy = userRef['username'];
    }
  }

  //aufrufen wenn nachricht geschrieben wurde
  async addMessage(text: string) {
    this.userService.currentUser$.subscribe(async (currentUser) => {
      if (currentUser) {
        const newMessage: ChannelMessage = this.setChannelMessage(
          text,
          currentUser
        );
        const messageRef = await addDoc(
          this.getMessageRef(),
          newMessage.getMessageJson()
        );
        console.log('Message added:', messageRef.id);
      }
    });
  }

  subMessageList() {
    return onSnapshot(this.getMessageRef(), (list) => {
      this.channelMessages = [];
      list.forEach((message) => {
        const data = message.data();
        this.channelMessages.push(
          new ChannelMessage({
            id: message.id,
            text: data['text'],
            time: data['time'],
            date: data['date'],
            authorName: data['authorName'],
            authorId: data['authorId'],
            profileImage: data['profileImage'],
          })
        );
      });
      console.log('Message received:', this.channelMessages);
    });
  }

  ngOnDestroy() {
    this.unsubMessages();
  }

  setChannelMessage(text: string, user: User): ChannelMessage {
    const now = new Date();
    return new ChannelMessage({
      id: '',
      text: text,
      time: now.toLocaleTimeString(),
      date: now.toLocaleDateString(),
      authorName: user.username,
      authorId: user.userId,
      profileImage: user.profileImage,
    });
  }

  getChannelRef() {
    return collection(this.firestore, 'channels');
  }

  getMessageRef() {
    return collection(this.firestore, `channels/${this.channelID}/messages`);
  }
}
