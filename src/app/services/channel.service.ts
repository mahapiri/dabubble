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

  private _isEditChannelPopup = new BehaviorSubject<boolean>(false);
  isEditChannelPopup$ = this._isEditChannelPopup.asObservable();

  clickedEditChannel: boolean = false;
  clickedAddMembers: boolean = false;
  clickedMembers: boolean = false;
  createdBy: string = '';
  channelID?: string = '';
  animationState: 'opening' | 'closing' | 'none' = 'none';

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
   * Updates the value of the edit channel popup state.
   * @param value - `true`: popup should be shown | `false`: popup should be hidden.
   */
  setIsEditChannelPopup(value: boolean) {
    this._isEditChannelPopup.next(value);
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
    console.log("newChannel", newChannel.getChannelJson());
      
    const channelRef = await addDoc(this.getChannelRef(), newChannel.getChannelJson());
    this.channelID = channelRef.id;
    await this.updateChannelWithID(channelRef.id);
    this.userService.updateUserChannels(user, this.channelID);
  }

  /**
   * Retrieves a channel document by its ID from Firestore.
   * @param {string} channelID - The ID of the channel.
   * @returns {Promise<Channel | undefined>} A promise that returns a new `Channel` instance with its data if the document exists, or `undefined` if it does not.
   */
  async getChannelById(channelID: string) {
    const channelRef = doc(this.firestore, 'channels', channelID);
    const channelDoc = await getDoc(channelRef);
    if (channelDoc.exists()) {
      return new Channel(channelDoc.data());
    } else {
      return undefined;
    }
  }

  /**
   * Updates a channel document by adding the ID data to the Firestore.
   * @param channelID - The new ID to set for the channel document.
   */
  async updateChannelWithID(channelID: string) {
    const channelRef = doc(this.firestore, 'channels', channelID);
    await updateDoc(channelRef, { channelID: channelID });
  }

  /**
   * Creates a new `Channel` object with the specified properties.
   * @param {string} name - The name of the channel.
   * @param {string} description - The description of the channel.
   * @param {User[]} user - An array of `User` objects: the members of the channel.
   * @param {string} [channelID] - An optional ID for the channel. If not provided, an empty string is used.
   * @returns {Channel} A new `Channel` object initialized with the provided properties.
   */
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

  /**
   * Adds the channel ID to the `userChannels` field of the user document in Firestore (member of the channel). Uses Firestore's `arrayUnion` function,
   * which ensures that the channel ID is added only if it is not already present in the array.
   * @param userdocId - The ID of the user document to be updated.
   * @param channelId - The ID of the channel to add to the user's list of channels.
   */
  async addChannelToContact(userdocId: string, channelId: string) {
    await updateDoc(doc(this.firestore, 'users', userdocId), {
      userChannels: arrayUnion(channelId),
    });
  }

  /**
   * Retrieves the username of the currently logged-in user and assigns it to the `createdBy' field in the channel object.
   */
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

  /**
   * Retrieves a reference to the 'channels' collection in Firestore.
   * @returns {CollectionReference} A Firestore `CollectionReference` for the 'channels' collection.
   */
  getChannelRef() {
    return collection(this.firestore, 'channels');
  }

  /**
   * Determines if the add member slider should be displayed: if editChannelPopup is open AND AddMembers dialog was clicked/is open.
   * @returns `true` if both conditions are met and the add member slider should be displayed, otherwise `false`.
   */
  isAddMemberSlider() {
    return this.isEditChannelPopup$ && this.clickedAddMembers;
  }

  /**
   * Closes the popup based on the current state of UI flags.
   */
  closePopup() {
    if (this.isAddMemberSlider()) {
      this.clickedEditChannel = true;
      this.clickedAddMembers = false;
    } else {
      this.clickedAddMembers = false;
      this.clickedEditChannel = false;
      this.clickedMembers = false;
      this.setIsEditChannelPopup(false);
    }
  }
}
