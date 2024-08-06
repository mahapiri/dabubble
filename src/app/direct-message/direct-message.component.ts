import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { WorkspaceMenuComponent } from '../shared/workspace-menu/workspace-menu.component';
import { DirectMessageService } from '../services/direct-message.service';
import { User } from '../../models/user.class';
import { UserService } from '../services/user.service';
import { DmMessageComponent } from './dm-message/dm-message.component';
import { doc, Firestore, getDoc } from '@angular/fire/firestore';
import { user } from '@angular/fire/auth';
@Component({
  selector: 'app-direct-message',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    MatInputModule,
    MatListModule,
    CommonModule,
    WorkspaceMenuComponent,
    DmMessageComponent
  ],
  templateUrl: './direct-message.component.html',
  styleUrl: './direct-message.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DirectMessageComponent implements OnInit {
  private firestore: Firestore = inject(Firestore);
  public directMessageService : DirectMessageService = inject(DirectMessageService);
  public userService : UserService = inject(UserService);
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  profile: User | null = null;

  constructor() {
    
  }

  ngOnInit() {
      this.directMessageService.userSelected$.subscribe((user) => {
        this.profile = user;
        this.cdr.markForCheck();
      })
  }

  async createMessage(messageText: string, messageInput: HTMLInputElement, profile: any) {
    if (!messageText.trim()) {
      console.log('Leere Nachricht')
      return;
    }

    const currentUser = await this.getUserList();
    const username = currentUser['username'];
    const profileimage = currentUser['profileImage'];

    const messageData = {
      authorId: this.userService.getUserRef().id,
      authorName: username,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      text: messageText,
      reaction: [],
      file: '',
      profileImg: profileimage,
    };

    await this.directMessageService.createMessageToDm(messageData, profile);
    messageInput.value = '';
  }



  async getUserList() {
    const username = this.userService.getUserRef().id;
    const docRef = doc(this.firestore, `users/${username}`);
    
    const userDoc = await getDoc(docRef);

    const userData: any = userDoc.data();

    return userData;
  }
  

}


