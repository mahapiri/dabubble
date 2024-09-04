import { Injectable } from '@angular/core';
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
import { Channel } from '../../models/channel.class';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  public selectedChannel = new BehaviorSubject<Channel | null>(null);
  selectedChannel$ = this.selectedChannel.asObservable();

  clickedEditChannel: boolean = false;
  clickedAddMembers: boolean = false;
  clickedMembers: boolean = false;
  createdBy: string = '';
  channelID?: string = '';

  /**
   * Subscribes to the `selectedChannel$` observable to react to changes in the selected channel.
   * Then, updates the ChannelID and listens for changes (read) in the message list.
   */
  constructor(private firestore: Firestore, private userService: UserService) {}

  /**
   * Sets the currently selected channel. It updates the `BehaviorSubject` `selectedChannel`, notifying all subscribers of the change.
   * @param channel - The `Channel` object to be set as the currently selected channel.
   */
  setSelectedChannel(channel: Channel) {
    if (channel.channelID!) {
      onSnapshot(doc(this.firestore, 'channels', channel.channelID), (doc) => {
        this.selectedChannel.next(new Channel(doc.data()));
      });
    }
  }

  /**
   * Updates the channelID variable based on the selected Channel.
   * @param channel Channel Object
   */
  setChannelId(channel: Channel) {
    this.channelID = channel.channelID;
  }

  /**
   * Creates a new channel and adds it to the Firestore database.
   * @param name - The name of the new channel.
   * @param description - A brief description of the new channel.
   * @param user - An array of `User` objects who will be members of the new channel.
   *
   * - Retrieves user info who is creating the channel. To set the `createdBy` field.
   * - Constructs a `Channel` object with the user-info
   * - Adds the new channel to the Firestore database.
   * - Sets the `channelID` property of the service to the ID of the newly created channel.
   * - Then updates the Channel in Firestore with the channel ID.
   * - Updates the `userService` with the new channel ID for each user. This may involve adding the new channel ID to the users' channel lists in the database.
   */
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

  /**
   * Loads the channels of the current user. Retrieves the channelIDs saved in the user via the user ref from the data base.
   * Gets the Channel Data from the channel collection with the ChannelIds.
   * Awaits all Promises, filters the channels for undefined channels and updates the Behavior Subject _userChannels.
   */
  async loadChannels() {
    onSnapshot(this.userService.getUserRef(), async (doc) => {
      const data = doc.data();
      if (data) {
        const channelIds = data['userChannels'] || [];
        const channelPromises = channelIds.map((channelId: string) =>
          this.getChannelById(channelId)
        );
        const channels = await Promise.all(channelPromises);
         this.userService._userChannels.next(
          channels.filter((channel) => channel !== undefined) as Channel[]
        );        
      }
    });
  }

  getChannelRef() {
    return collection(this.firestore, 'channels');
  }

  closePopup(){
    console.log("popup closed");
    
    this.clickedEditChannel = false;
    this.clickedAddMembers = false;
    this.clickedMembers = false;
  }
}
