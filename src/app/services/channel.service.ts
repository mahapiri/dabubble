import { inject, Injectable } from '@angular/core';
import { addDoc, collection, doc, Firestore, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ChannelService {
  firestore: Firestore = inject(Firestore)
  channelID: string = "";

  constructor() { }

  async createChannel() {
    console.log("test");

    const docRef = await addDoc(collection(this.firestore, "channels"),
      {
        channelName: "",
        channelMember: [],
        description: "",
        //channelID: this.docRef.toString()
      })
    this.channelID = docRef.id;
  }

  //aufrufen wenn nachricht geschrieben wurde
  async addAnotherDoc() {
    const docRef2 = await addDoc(collection(this.firestore, `channels/${this.channelID}/messages`),
      { test: "test 2" })
    console.log(docRef2.id);
  }




}
