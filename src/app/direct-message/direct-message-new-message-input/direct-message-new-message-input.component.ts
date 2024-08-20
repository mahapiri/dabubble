import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { DirectMessageService } from '../../services/direct-message.service';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { ClickOutsideDirective } from '../../directive/click-outside.directive';
import { EmojiPickerComponent } from '../../chat/emoji-picker/emoji-picker.component';
import { UploadService } from '../../services/upload.service';
import { User } from '../../../models/user.class';
import { DmMessage } from '../../../models/direct-message.class';
import { TaggingComponent } from '../../chat/tagging/tagging.component';
import { DirectMessageHeaderComponent } from '../direct-message-header/direct-message-header.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-direct-message-new-message-input',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    FormsModule,
    PickerComponent,
    EmojiComponent,
    ClickOutsideDirective,
    EmojiPickerComponent,
    ClickOutsideDirective,
    TaggingComponent,
    DirectMessageHeaderComponent
  ],
  templateUrl: './direct-message-new-message-input.component.html',
  styleUrl: './direct-message-new-message-input.component.scss',
})

export class DirectMessageNewMessageInputComponent implements OnInit, OnDestroy {
  private directMessageService: DirectMessageService = inject(DirectMessageService);
  public uploadService: UploadService = inject(UploadService);
  private userSubscription: Subscription = new Subscription();

  profile: Partial<User> = {};
  @Output() messageCreated: EventEmitter<void> = new EventEmitter<void>();

  messageText: string = '';
  isEmoji: boolean = false;
  notOpen: boolean = true;
  @Input() message!: DmMessage;



  //// add member

  isTag: boolean = false;
  showUser: User[] = [];

  
  /**
   * subscribes the current clicked profile
   */
  ngOnInit() {
    this.userSubscription = this.directMessageService.clickedProfile$.subscribe((profile) => {
      this.profile = {
        username: profile?.username,
        userId: profile?.userId,
        profileImage: profile?.profileImage,
        state: profile?.state
      };
    });
  }


  /**
   * unsubscribes user subscription if DOM destroy
   */
  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }


  /**
   * checks the valid of a message to start the newDmMessage function
   */
  async createMessage() {
    if (!this.messageText.trim()) {
      console.warn('The message field is empty. Please type a message!');
    } else {
      await this.directMessageService.newDmMessage(this.messageText);
      this.messageCreated.emit();
    }
    this.messageText = '';
  }


  /**
   * open the Emoji Container
   */
  openEmojiSet(event: Event) {
    event.stopPropagation();
    if (this.notOpen) {
      this.isEmoji = !this.isEmoji;
    }

  }

  /**
   * open the Emoji Container
   */
  closeEmojiSet() {
    this.isEmoji = false;
    this.notOpen = false;
    setTimeout(() => this.notOpen = true, 1000);
  }


  /**
  * handles emoji selection from the EmojiPickerComponent
  */
  onEmojiSelected(emoji: string) {
    this.messageText += emoji;
    this.closeEmojiSet();
  }


  /**
  * sends the message if the message is valid and the Enter key is pressed
  * when Shift+Enter is pressed, a line break is inserted instead
  */
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.createMessage();
    }
  }


  async chooseFile(event: Event) {
    this.uploadService.onFileSelected(event)
    this.uploadService.uploadPicture();
    this.messageText = this.uploadService.downloadURL;
    await this.createMessage();
  }




  /// add member


  openPopup(event: Event) {
    event?.stopPropagation();
    this.isTag = !this.isTag;
  }


  closePopup() {
    this.isTag = false;
  }

  selectMember(user: User) {
  }
}
