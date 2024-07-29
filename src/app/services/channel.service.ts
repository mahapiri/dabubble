import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  doc,
  Firestore,
  setDoc,
  updateDoc,
  arrayUnion,
  getDoc,
} from '@angular/fire/firestore';
import { UserService } from './user.service';
import { User } from '@angular/fire/auth';


@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  firestore: Firestore = inject(Firestore);
  userService: UserService = inject(UserService)
  channelID: string = '';


  constructor() { }


  async createChannel(name: string, description: string, user: User[]) {
    const docRef = await addDoc(collection(this.firestore, 'channels'), {
      channelName: name,
      //channelMember: user,
      //createdBy: this.getCreatedByUser(),
      description: description,
    });
    this.channelID = docRef.id;
    // this.addChannelToContact(user.id, docRef.id);
    console.log('Channel:', docRef.id, 'created');
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
      { test: 'test 2' },
    );
    console.log(docRef2.id);
  }

  async getCreatedByUser() {
    let userRef = await (await getDoc(doc(this.firestore, "users", this.userService.userID))).data()
    if (userRef) {
      return userRef['username'];
    }


  }
}
