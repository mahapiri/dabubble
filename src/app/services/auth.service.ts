import { inject, Injectable, HostListener } from '@angular/core';
import { User } from '../../models/user.class';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  deleteUser,
} from '@angular/fire/auth';
import { UserService } from './user.service';
import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  Firestore,
  getDoc,
  getDocs,
  runTransaction,
  setDoc,
  updateDoc,
  where,
  query,
} from '@angular/fire/firestore';
import { Channel } from '../../models/channel.class';
import { ChannelService } from './channel.service';
import { ChannelMessageService } from './channel-message.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  currentUser: User = new User();
  userService: UserService = inject(UserService);
  channelService: ChannelService = inject(ChannelService);
  channelMessageService: ChannelMessageService = inject(ChannelMessageService);
  firestore: Firestore = inject(Firestore);
  provider = new GoogleAuthProvider();
  usermail: string = '';
  username: string = '';
  userpassword: string = '';
  profileImage: string | ArrayBuffer | null = '';
  state: string = 'online';
  userId: string = '';
  loggedInAsGuest: boolean = false;
  firstOpen: boolean = false;

  constructor(private auth: Auth) {}

  /**
   * creates the user with the given userCredentials and saves the corresponding userId
   */
  async createUser() {
    await createUserWithEmailAndPassword(
      this.auth,
      this.usermail,
      this.userpassword
    ).then(async (userCredential) => {
      this.userId = userCredential.user.uid;
    });
  }

  /**
   * saves the cresated user in the user-document of the firestore database
   */
  async saveUserInDocument() {
    await setDoc(doc(this.firestore, 'users', this.userId), this.setUser());
  }

  /**
   * adds the new user to the channelmember-list of the two starting channels
   */
  async setStartingChannels() {
    const user = this.setUser();
    const updates = [
      updateDoc(doc(this.firestore, 'channels', 'HRyA2fYZpKKap6d1sJS0'), {
        channelMember: arrayUnion(user),
      }),
      updateDoc(doc(this.firestore, 'channels', '3cxTzZ2xWpatlmxNOpbf'), {
        channelMember: arrayUnion(user),
      }),
    ];
    await Promise.all(updates);
  }

  /**
   * Searches for a user with this specific email address
   * @param email the email searched for
   * @returns true if user is found, otherwise false
   */
  async fetchUserByEmail(email: string): Promise<any> {
    const userQuery = query(
      collection(this.firestore, 'users'),
      where('email', '==', email)
    );
    const userSnapshot = await getDocs(userQuery);
    return !userSnapshot.empty;
  }

  /**
   * logs in the user with the given user credentials from the log-in screen
   * @param mail usermail
   * @param password userpassword
   */
  async logInUser(mail: string, password: string) {
    await signInWithEmailAndPassword(this.auth, mail, password);
  }

  /**
   * unsubscribes from the channel messages and from the current user Subscriptions and logs out the current user.
   * If the current user is from a guest account, it also deletes the guest user
   */
  async logOut() {
    this.unsubFromMessageList();
    this.userService.unsubscribe();
    if (this.loggedInAsGuest) {
      this.deleteGuestUser();
      this.loggedInAsGuest = false;
    }
    await signOut(this.auth);
  }

  /**
   * unsubscribes from the channel-messagees
   */
  unsubFromMessageList() {
    if (this.channelMessageService.messageListUnsubscribe) {
      this.channelMessageService.messageListUnsubscribe();
    }
  }

  /**
   * signs the user in with the google authentification, saves the userId and creates a new user from the google data
   */
  async googleLogin() {
    await signInWithPopup(this.auth, this.provider)
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential) {
          this.userId = result.user.uid;
          this.setGoogleUser(result.user);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  /**
   * saves the userdata provided from the google account
   * @param user
   */
  setGoogleUser(user: any) {
    this.username = user.displayName;
    this.usermail = user.email;
    this.profileImage = user.photoURL ?? 'assets/img/character-empty.png';
    this.lookForGoogleUserInDatabase(user.uid);
  }

  /**
   * checks if the user with the current google data and ID already exists in the user database of firestore.
   * If not, the user is created and saved in the database
   * @param userid the ID of the current user
   */
  async lookForGoogleUserInDatabase(userid: string) {
    const userdoc = await getDoc(doc(this.firestore, 'users', userid));
    if (!userdoc.exists()) {
      await this.setStartingChannels();
      await this.saveUserInDocument();
    }
  }

  /**
   * creates a user Object from the provided userdata
   * @returns the userObject of the new User
   */
  setUser() {
    const user = {
      username: this.username,
      email: this.usermail,
      profileImage: this.profileImage,
      userChannels: ['HRyA2fYZpKKap6d1sJS0', '3cxTzZ2xWpatlmxNOpbf'],
      state: this.state,
      userId: this.userId,
    };
    if (this.loggedInAsGuest) {
      user.username = 'Gast';
      user.email = 'gast@gast.de';
      user.profileImage = 'assets/img/character-empty.png';
    }
    return user;
  }

  /**
   * deletes the guest user from all channels and directmessages
   */
  async deleteGuestUser() {
    const user = this.auth.currentUser;
    if (user) {
      await this.deleteGuestFromAllChannels(this.userId);
      await this.deleteDirectMessages(this.userId);
      await deleteUser(user).then().catch();
      await deleteDoc(doc(this.firestore, 'users', this.userId));
    }
  }

  /**
   * looks up in witch channels the guestuser was a member and removes the user from all of these channels
   * @param idToDelete ID of the user
   */
  async deleteGuestFromAllChannels(idToDelete: string) {
    const userDocSnap = await getDoc(doc(this.firestore, 'users', idToDelete));
    if (userDocSnap.exists()) {
      const userChannels = userDocSnap.data()['userChannels'];
      for (const channelID of userChannels) {
        await this.channelService.getChannelById(channelID).then((channel) => {
          if (channel) {
            this.deleteUserFromChannel(channel, idToDelete);
          }
        });
      }
    }
  }

  /**
   * removes the user from the channel by updating the channelMember-array with an array, where the user is´t part of
   * @param channel channel where the user is part of
   * @param idToDelete userId
   */
  async deleteUserFromChannel(channel: Channel, idToDelete: string) {
    if (channel.channelID) {
      let reducedArray = this.createArrayWithoutUser(channel, idToDelete);
      const channelRef = doc(this.firestore, 'channels', channel.channelID);
      await updateDoc(channelRef, {
        channelMember: reducedArray,
      });
    }
  }

  /**
   * filters out the user from the channelMember array
   * @param channel channel where the user is part of
   * @param idToDelete userId
   * @returns a channelMember-array without the user
   */
  createArrayWithoutUser(channel: Channel, idToDelete: string) {
    return channel.channelMember.filter(
      (member) => member.userId !== idToDelete
    );
  }

  /**
   * Deletes all direct messages associated with the specified user ID.
   */
  async deleteDirectMessages(userId: string) {
    const directMessagesRef = collection(this.firestore, 'direct-messages');
    const q = query(
      directMessagesRef,
      where('userIDs', 'array-contains', userId)
    );
    const querySnapshot = await getDocs(q);

    for (const doc of querySnapshot.docs) {
      const directMessageId = doc.id;
      await this.deleteDirectMessage(directMessageId);
    }
  }

  /**
   * Deletes a specific direct message document and its associated messages.
   */
  async deleteDirectMessage(directMessageId: string) {
    const messagesRef = collection(
      this.firestore,
      `direct-messages/${directMessageId}/messages`
    );
    const messagesSnapshot = await getDocs(messagesRef);
    for (const messageDoc of messagesSnapshot.docs) {
      await deleteDoc(messageDoc.ref);
    }

    const directMessageDocRef = doc(
      this.firestore,
      'direct-messages',
      directMessageId
    );
    await deleteDoc(directMessageDocRef);
  }
}
