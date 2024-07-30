import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  doc,
  Firestore,
  updateDoc,
  arrayUnion,
  getDoc,
} from '@angular/fire/firestore';
import { UserService } from './user.service';
import { User } from '../../models/user.class';
import { Channel } from '../../models/channel.class';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  firestore: Firestore = inject(Firestore);
  userService: UserService = inject(UserService);
  channelID: string = '';
  createdBy: string = '';

  constructor() {}

  async createChannel(name: string, description: string, user: User[]) {
    await this.getCreatedByUser();
    const newChannel: Channel = this.setChannelObject(name, description, user);

    const docRef = await addDoc(
      collection(this.firestore, 'channels'),
      newChannel.getChannelJson()
    );

    this.channelID = docRef.id;

    await this.updateChannelWithID(docRef.id);

    // this.addChannelToContact(user.id, docRef.id);
    console.log('Channel:', docRef.id, 'created');
  }

  async updateChannelWithID(channelID: string) {
    const docRef = doc(this.firestore, 'channels', channelID);
    await updateDoc(docRef, { channelID: channelID });
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

  //aufrufen wenn nachricht geschrieben wurde
  async addMessageInChannel() {
    const docRef2 = await addDoc(
      collection(this.firestore, `channels/${this.channelID}/messages`),
      { test: 'test 2' }
    );
    console.log(docRef2.id);
  }

  async getCreatedByUser() {
    let userRef = (
      await getDoc(doc(this.firestore, 'users', this.userService.userID))
    ).data();
    if (userRef) {
      this.createdBy = userRef['username'];
    }
  }
}
