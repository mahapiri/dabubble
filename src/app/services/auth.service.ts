import { inject, Injectable, HostListener } from '@angular/core';
import { User } from '../../models/user.class';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, deleteUser } from '@angular/fire/auth';
import { UserService } from './user.service';
import { arrayRemove, arrayUnion, collection, deleteDoc, doc, Firestore, getDoc, getDocs, runTransaction, setDoc, updateDoc } from '@angular/fire/firestore';
import { Channel } from '../../models/channel.class';
import { ChannelService } from './channel.service';
import { ChannelMessageService } from './channel-message.service';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  currentUser: User = new User;
  userService: UserService = inject(UserService);
  channelService: ChannelService = inject(ChannelService);
  channelMessageService: ChannelMessageService = inject(ChannelMessageService)
  firestore: Firestore = inject(Firestore);
  provider = new GoogleAuthProvider();
  usermail: string = "";
  username: string = "";
  userpassword: string = "";
  profileImage: string | ArrayBuffer | null = "";
  state: string = "online";
  userId: string = "";
  loggedInAsGuest: boolean = false;

  constructor(private auth: Auth) { }

  async createUser() {
    await createUserWithEmailAndPassword(this.auth, this.usermail, this.userpassword).then(async (userCredential) => {
      this.userId = userCredential.user.uid;
    })
  }

  async saveUserInDocument() {
    await setDoc(doc(this.firestore, "users", this.userId), this.setUser());
  }

  async setStartingChannels() {
    const user = this.setUser();   
    const updates = [
      updateDoc(doc(this.firestore, 'channels', 'HRyA2fYZpKKap6d1sJS0'), {
        channelMember: arrayUnion(user)
      }),
      updateDoc(doc(this.firestore, 'channels', '3cxTzZ2xWpatlmxNOpbf'), {
        channelMember: arrayUnion(user)
      })
    ];
    await Promise.all(updates);
  }


  async logInUser(mail: string, password: string) {
    await signInWithEmailAndPassword(this.auth, mail, password)
  }

  async logOut() {
    if (this.loggedInAsGuest) {
      this.deleteGuestUser();
      this.loggedInAsGuest = false;
    }
    this.userService.unsubscribe()
    await signOut(this.auth);
  }

  async googleLogin() {
    await signInWithPopup(this.auth, this.provider).then((result) => {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential) {
        this.userId = result.user.uid;
        this.setGoogleUser(result.user);
      }
    }).catch((error) => {
      console.error(error);
    });
  }

  setGoogleUser(user: any) {
    this.username = user.displayName;
    this.usermail = user.email;
    this.profileImage = user.photoURL ?? "assets/img/character-empty.png";
    this.lookForGoogleUserInDatabase(user.uid)
  }


  async lookForGoogleUserInDatabase(userid: string) {
    const userdoc = await getDoc(doc(this.firestore, "users", userid))
    if (!userdoc.exists()) {
      await this.setStartingChannels()
      await this.saveUserInDocument()
    }
  }

  setUser() {
    const user = {
      username: this.username,
      email: this.usermail,
      profileImage: this.profileImage,
      userChannels: ["HRyA2fYZpKKap6d1sJS0", "3cxTzZ2xWpatlmxNOpbf"],
      state: this.state,
      userId: this.userId
    };
    if (this.loggedInAsGuest) {
      user.username = 'Gast';
      user.email = 'gast@gast.de';
      user.profileImage = 'assets/img/character-empty.png';
    }
    return user;
  }

  async deleteGuestUser() {
    const user = this.auth.currentUser;
    if (user) {
      await this.deleteGuestFromAllChannels()
      await deleteUser(user).then().catch();
      await deleteDoc(doc(this.firestore, "users", this.userId));
    }
  }

  async deleteGuestFromAllChannels() {
    const userDocSnap = await getDoc(doc(this.firestore, "users", this.userId));
    if (userDocSnap.exists()) {
      const userChannels = userDocSnap.data()['userChannels'];
      for (const channelID of userChannels) {
        await this.channelService.getChannelById(channelID).then((channel) => {
          if (channel) {
            this.deleteUserFromChannel(channel)
          }
        })
      }
    }
  }

  async deleteUserFromChannel(channel: Channel) {
    if (channel.channelID) {
      let reducedArray = this.createArrayWithoutUser(channel);
      const channelRef = doc(this.firestore, "channels", channel.channelID);
      await updateDoc(channelRef, {
        channelMember: reducedArray
      });
    }
  }

  createArrayWithoutUser(channel: Channel) {
    return channel.channelMember.filter(member => member.userId !== this.userId);
  }

  @HostListener('window:beforeunload', ['$event'])
  async unloadNotification($event: any): Promise<void> {
   this.logOut()
  }

}
