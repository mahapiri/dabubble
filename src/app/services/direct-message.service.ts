import { inject, Injectable, OnDestroy, OnInit } from '@angular/core';
import { UserService } from './user.service';
import { addDoc, collection, doc, Firestore, getDocs, setDoc, where, query, CollectionReference, DocumentData, onSnapshot } from '@angular/fire/firestore';
import { User } from '../../models/user.class';
import { BehaviorSubject, Subscription } from 'rxjs';
import { DmMessage } from '../../models/direct-message.class';

@Injectable({
  providedIn: 'root'
})
export class DirectMessageService implements OnInit, OnDestroy {
  private firestore: Firestore = inject(Firestore);
  private userService: UserService = inject(UserService);

  private messages = new BehaviorSubject<DmMessage[]>([]);
  public messages$ = this.messages.asObservable();

  private clickedProfile = new BehaviorSubject<User | null>(null);
  public clickedProfile$ = this.clickedProfile.asObservable();

  private currentUserSubscription: Subscription = new Subscription();
  private profileSubscription: Subscription = new Subscription();

  directMessageId: string | null = null;
  currentUser: User | null = null;
  currentClickedProfile: User | null = null;
  currentMessageRef: string = '';


  constructor() {
    this.currentUserSubscription = this.userService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
    this.profileSubscription = this.clickedProfile$.subscribe((profile) => {
      this.currentClickedProfile = profile;
    });
  }


  ngOnInit() {

  }


  ngOnDestroy(): void {
    this.currentUserSubscription.unsubscribe();
    this.profileSubscription.unsubscribe();
  }


  async addDirectMessage() {
    const currentUser = this.currentUser?.userId;
    const profile = this.currentClickedProfile?.userId;

    if (currentUser === profile) {
      this.currentMessageRef = await this.handleSelfDm(currentUser);
    } else {
      this.currentMessageRef = await this.handleUsertoUserDm(currentUser, profile);
    }

    return this.currentMessageRef;
  }


  async handleSelfDm(currentUser: any) {
    const existingOwnDmId = await this.proofExistingOwnDm(currentUser);

    if (!existingOwnDmId) {
      const messageRef = await addDoc(collection(this.firestore, 'direct-messages'), {
        userIDs: [currentUser],
      });
      await this.setDirectMessageID(messageRef.id);
      this.directMessageId = messageRef.id;
      return messageRef.id;
    } else {
      // console.log('Own Channel exist already', existingOwnDmId);
      this.directMessageId = existingOwnDmId;
      return existingOwnDmId;
    }
  }


  async handleUsertoUserDm(currentUserId: any, otherUserId: any) {
    const existingDmId = await this.proofExistingDm(currentUserId, otherUserId);

    if (!existingDmId) {
      const messageRef = await addDoc(collection(this.firestore, 'direct-messages'), {
        userIDs: [otherUserId, currentUserId],
      });
      await this.setDirectMessageID(messageRef.id);
      this.directMessageId = messageRef.id;
      return messageRef.id;
    } else {
      // console.log('Channel exist already', existingDmId);
      this.directMessageId = existingDmId;
      return existingDmId;
    }
  }


  async proofExistingDm(currentUserId: string, otherUserId: string): Promise<string | null> {
    const directMessageRef = this.getCollectionRef();
    const q = query(directMessageRef, where('userIDs', 'array-contains', currentUserId));
    const querySnapshot = await getDocs(q);

    for (const doc of querySnapshot.docs) {
      const userIds = doc.data()['userIDs'] as string[];
      if ((userIds.includes(otherUserId) && userIds.includes(currentUserId)) || (currentUserId === otherUserId && userIds.includes(currentUserId))) {
        return doc.id;
      }
    }
    return null;
  }


  async proofExistingOwnDm(userId: string): Promise<string | null> {
    const directMessageRef = this.getCollectionRef();
    const q = query(directMessageRef, where('userIDs', 'array-contains', userId));
    const querySnapshot = await getDocs(q);

    for (const document of querySnapshot.docs) {
      const userIds = document.data()['userIDs'] as string[];
      if (userIds.length === 1 && userIds.includes(userId)) {
        return document.id;
      }
    }
    return null;
  }


  async openDmFromUser(profile: User) {
    this.getActualProfile(profile);
    await this.addDirectMessage();
    // this.getDmInfo();
    this.showMessages(this.currentMessageRef);
  }


  getActualProfile(profile: User) {
    this.clickedProfile.next(profile);
  }


  getDmInfo() {
    console.log('\n','Eingeloggter User:',this.currentUser?.username,'\n','Auf Profil geklickt:',this.currentClickedProfile?.username,'\n','messageRef:', this.currentMessageRef);
  }


  async setDirectMessageID(id: string) {
    const docRef = doc(this.getCollectionRef(), id);
    await setDoc(docRef, {
      directMessageID: id,
    }, { merge: true });
  }


  getCollectionRef(): CollectionReference<DocumentData> {
    return collection(this.firestore, 'direct-messages');
  }


  getMessageRef(): CollectionReference<DocumentData> {
    return collection(this.firestore, `direct-messages/${this.directMessageId}/messages`);
  }


  getMessageRefForId(directMessageId: string): CollectionReference<DocumentData> {
    return collection(this.firestore, `direct-messages/${directMessageId}/messages`);
  }


  showMessages(directMessageId: string) {
    const messageRef = this.getMessageRefForId(directMessageId);

    onSnapshot(messageRef, (snapshot) => {
      const messages: DmMessage[] = [];
      snapshot.forEach((doc) => {
        messages.push(doc.data() as DmMessage);
      });

      this.messages.next(messages);
    });
  }


  newDmMessage(message: string) {
    const timeOptions = this.timeOption();

    const messageData = {
      authorId: this.currentUser?.userId,
      authorName: this.currentUser?.username,
      time: new Date().toLocaleTimeString('de-DE', timeOptions),
      date: new Date().toISOString().split('T')[0],
      text: message,
      reaction: [],
      file: '',
      profileImg: this.currentUser?.profileImage,
    };

    this.createMessageToDm(messageData);
  }


  async createMessageToDm(messageData: any) {
    await this.addDirectMessage();
    const docRef = doc(this.getMessageRef());
    await setDoc(docRef, messageData, { merge: true });
  }


  timeOption(): Intl.DateTimeFormatOptions {
    return {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
  }
}