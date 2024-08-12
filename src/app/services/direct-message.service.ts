import { inject, Injectable, OnDestroy, OnInit } from '@angular/core';
import { UserService } from './user.service';
import {
  addDoc,
  collection,
  doc,
  Firestore,
  getDocs,
  setDoc,
  where,
  query,
  CollectionReference,
  DocumentData,
  onSnapshot,
  orderBy,
  limit,
} from '@angular/fire/firestore';
import { User } from '../../models/user.class';
import { BehaviorSubject, Subscription } from 'rxjs';
import { DmMessage } from '../../models/direct-message.class';
import { ChatService } from './chat.service';
import { NumberFormatStyle } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class DirectMessageService implements OnInit, OnDestroy {
  private firestore: Firestore = inject(Firestore);
  private userService: UserService = inject(UserService);
  private chatService: ChatService = inject(ChatService);

  private messages = new BehaviorSubject<DmMessage[]>([]);
  public messages$ = this.messages.asObservable();

  private clickedProfile = new BehaviorSubject<User | null>(null);
  public clickedProfile$ = this.clickedProfile.asObservable();

  private currentUserSubscription: Subscription = new Subscription();
  private profileSubscription: Subscription = new Subscription();
  private messagesSubscription: Subscription = new Subscription();

  directMessageId: any;
  currentUser: User | null = null;
  currentClickedProfile: User | null = null;
  previousDate: string | null = null;

  constructor() {
    this.currentUserSubscription = this.userService.currentUser$.subscribe(
      (user) => {
        this.currentUser = user;
      }
    );
    this.profileSubscription = this.clickedProfile$.subscribe((profile) => {
      this.currentClickedProfile = profile;
    });
  }

  ngOnInit() {}

  ngOnDestroy(): void {
    this.currentUserSubscription.unsubscribe();
    this.profileSubscription.unsubscribe();
    this.messagesSubscription.unsubscribe();
  }

  async openDmFromUser(profile: User) {
    this.getActualProfile(profile);
    await this.addDirectMessage();
    // this.getDmInfo();
    this.previousDate = null;
    this.showMessages(this.directMessageId);
  }

  getActualProfile(profile: User) {
    this.clickedProfile.next(profile);
  }

  async addDirectMessage() {
    const currentUser = this.currentUser?.userId;
    const profile = this.currentClickedProfile?.userId;

    if (currentUser === profile) {
      this.directMessageId = await this.handleSelfDm(currentUser);
    } else {
      this.directMessageId = await this.handleUsertoUserDm(
        currentUser,
        profile
      );
    }
    return this.directMessageId;
  }

  async handleSelfDm(currentUser: any) {
    const existingOwnDmId = await this.proofExistingOwnDm(currentUser);

    if (!existingOwnDmId) {
      const messageRef = await addDoc(
        collection(this.firestore, 'direct-messages'),
        {
          userIDs: [currentUser],
        }
      );
      await this.setDirectMessageID(messageRef.id);
      this.directMessageId = messageRef.id;
      return messageRef.id;
    } else {
      this.directMessageId = existingOwnDmId;
      return existingOwnDmId;
    }
  }

  async handleUsertoUserDm(currentUserId: any, otherUserId: any) {
    const existingDmId = await this.proofExistingDm(currentUserId, otherUserId);

    if (!existingDmId) {
      const messageRef = await addDoc(
        collection(this.firestore, 'direct-messages'),
        {
          userIDs: [otherUserId, currentUserId],
        }
      );
      await this.setDirectMessageID(messageRef.id);
      this.directMessageId = messageRef.id;
      return messageRef.id;
    } else {
      this.directMessageId = existingDmId;
      return existingDmId;
    }
  }

  async proofExistingDm(
    currentUserId: string,
    otherUserId: string
  ): Promise<string | null> {
    const directMessageRef = this.getCollectionRef();
    const q = query(
      directMessageRef,
      where('userIDs', 'array-contains', currentUserId)
    );
    const querySnapshot = await getDocs(q);

    for (const doc of querySnapshot.docs) {
      const userIds = doc.data()['userIDs'] as string[];
      if (
        (userIds.includes(otherUserId) && userIds.includes(currentUserId)) ||
        (currentUserId === otherUserId && userIds.includes(currentUserId))
      ) {
        return doc.id;
      }
    }
    return null;
  }

  async proofExistingOwnDm(userId: string): Promise<string | null> {
    const directMessageRef = this.getCollectionRef();
    const q = query(
      directMessageRef,
      where('userIDs', 'array-contains', userId)
    );
    const querySnapshot = await getDocs(q);

    for (const document of querySnapshot.docs) {
      const userIds = document.data()['userIDs'] as string[];
      if (userIds.length === 1 && userIds.includes(userId)) {
        return document.id;
      }
    }
    return null;
  }

  getDmInfo() {
    console.log(
      '\n',
      'Eingeloggter User:',
      this.currentUser?.username,
      '\n',
      'Auf Profil geklickt:',
      this.currentClickedProfile?.username,
      '\n',
      'messageRef:',
      this.directMessageId
    );
  }

  async setDirectMessageID(id: string) {
    const docRef = doc(this.getCollectionRef(), id);
    await setDoc(
      docRef,
      {
        directMessageID: id,
      },
      { merge: true }
    );
  }

  getCollectionRef(): CollectionReference<DocumentData> {
    return collection(this.firestore, 'direct-messages');
  }

  getMessagesRef(): CollectionReference<DocumentData> {
    return collection(
      this.firestore,
      `direct-messages/${this.directMessageId}/messages`
    );
  }

  getMessageRefForId(
    directMessageId: string
  ): CollectionReference<DocumentData> {
    return collection(
      this.firestore,
      `direct-messages/${directMessageId}/messages`
    );
  }

  showMessages(directMessageId: string) {
    const messageRef = this.getMessageRefForId(directMessageId);

    const q = query(
      messageRef,
      orderBy('date', 'asc'),
      orderBy('time', 'asc'),
      limit(100)
    );

    onSnapshot(q, (snapshot) => {
      const messages: DmMessage[] = [];
      this.previousDate = null;

      snapshot.forEach((doc) => {
        const data = doc.data();
        const currentMessage = this.setMessageObject(doc.id, data);

        currentMessage.isFirstMessageOfDay =
          currentMessage.date !== this.previousDate;
        this.previousDate = currentMessage.date;

        messages.push(currentMessage);
      });

      messages.reverse();
      this.messages.next(messages);
    });
  }

  setMessageObject(id: string, data: any) {
    return new DmMessage({
      authorId: data['authorId'],
      authorName: data['authorName'],
      date: data['date'],
      time: data['time'],
      text: data['text'],
      reactionId: [],
      file: '',
      id: data['id'],
      profileImg: data['profileImg'],
      isFirstMessageOfDay: false,
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
      reactionId: [],
      file: '',
      id: '',
      profileImg: this.currentUser?.profileImage,
      isFirstMessageOfDay: false,
    };
    this.saveMessage(messageData);
  }

  async saveMessage(messageData: any) {
    const docRef = await addDoc(this.getMessagesRef(), messageData);
    const currentMessage = this.setMessageObject(docRef.id, messageData);

    this.chatService.setFirstMessageOfDay(currentMessage);
    await this.setDirectMessageMessageID(docRef.id);
    this.showMessages(this.directMessageId);
  }

  async setDirectMessageMessageID(id: string) {
    const docRef = doc(this.getMessagesRef(), id);

    await setDoc(
      docRef,
      {
        id: docRef.id,
      },
      { merge: true }
    );
  }

  timeOption(): Intl.DateTimeFormatOptions {
    return {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
  }
}
