import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { UploadService } from '../../services/upload.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmojiPickerComponent } from '../../chat/emoji-picker/emoji-picker.component';
import { MatButtonModule } from '@angular/material/button';
import { TaggingComponent } from '../../chat/tagging/tagging.component';
import { ClickOutsideDirective } from '../../directive/click-outside.directive';

@Component({
  selector: 'app-new-message-input',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    EmojiPickerComponent,
    MatButtonModule,
    TaggingComponent,
    ClickOutsideDirective
  ],
  templateUrl: './new-message-input.component.html',
  styleUrl: './new-message-input.component.scss'
})
export class NewMessageInputComponent {
  public uploadService: UploadService = inject(UploadService)

  messageText: string = '';
  uploadPath: string = 'new-message'
  isEmoji: boolean = false;
  notOpen: boolean = true;
  isTag: boolean = false;


  /**
  * sends the message if the message is valid and the Enter key is pressed
  * when Shift+Enter is pressed, a line break is inserted instead
  */
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      console.log('create new message');
    }
  }


  async chooseFile(event: Event) {
    this.uploadService.onFileSelected(event)
    this.uploadService.uploadPath = this.uploadPath;
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
  * close the Emoji Container
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
  * checks the valid of a message to start the newDmMessage function
  */
  async createMessage() {
    await this.checkPictureUpload();
    if (!this.messageText.trim()) {
      console.warn('The message field is empty. Please type a message!');
    } else {
      // this.messageCreated.emit();
    }
    this.messageText = '';
  }


  /**
  * calls the upload method if a file was chosen and saves the dawnload URL of the file to the messageText
  */
  async checkPictureUpload() {
    if (this.uploadService.fileChosen) {
      await this.uploadService.uploadPicture();
      this.messageText = this.uploadService.downloadURL;
    }
  }


  /**
  * open tagging popup
  */
  openPopup(event: Event) {
    event?.stopPropagation();
    this.isTag = !this.isTag;
  }

  /**
  * close tagging popup
  */
  closePopup() {
    this.isTag = false;
  }

}


