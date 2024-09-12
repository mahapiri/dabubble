import { inject, Injectable } from '@angular/core';
import {
  getDownloadURL,
  getStorage,
  ref,
  Storage,
  uploadBytes,
} from '@angular/fire/storage';
import { AuthService } from './auth.service';
import { BehaviorSubject } from 'rxjs';
import { UserService } from './user.service';


@Injectable({
  providedIn: 'root',
})
export class UploadService {
  storage: Storage = inject(Storage);
  authService: AuthService = inject(AuthService);
  userService: UserService = inject(UserService);


  acceptedFileTypes: string = '.jpg, .jpeg, .png, .pdf';
  file: any = 'Datei hochladen';
  uploadPath: string = '';
  userSpecificPath: string = '';
  storageRef = ref(this.storage, this.userSpecificPath);
  downloadURL: string = '';
  channelFileChosen: boolean = false;
  threadFileChosen: boolean = false;
  dmFileChosen: boolean = false;
  newMessageFileChosen: boolean = false


  public currentImg = new BehaviorSubject<string | ArrayBuffer | null>('');
  currentImg$ = this.currentImg.asObservable();


  constructor() { }

  /**
   * opens the file input when called
   */
  triggerFileInput(fileInputId: string): void {
    const fileInput = document.getElementById(
      fileInputId
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }


  /**
   * saves the selected file in the file variable and sets the observable for the current image
   * @param event
   */
  onFileSelected(event: Event, fileSource: string): void {
    this.noFileChosen();
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.file = input.files[0];
      if (
        this.file.type.startsWith('image/') ||
        this.file.type.startsWith('application/')
      ) {
        const reader = new FileReader();
        this.setPathForUpload(fileSource);
        reader.onload = () => {
          this.currentImg.next(reader.result);
        };
        reader.readAsDataURL(this.file);
      } else {
        console.error('Die ausgewählte Datei ist kein Bild.');
      }
      input.value = '';
    }
  }


  /**
   * sets the upload path for the file
   */
  setPathForUpload(fileSource: string) {
    if (fileSource === 'channel') {
      this.channelFileChosen = true;
    } else if (fileSource === 'thread') {
      this.threadFileChosen = true;
    } else if (fileSource === 'directMessage') {
      this.dmFileChosen = true;
    } else if (fileSource === 'newMessage') {
      this.newMessageFileChosen = true;
    }
    this.userSpecificPath = `${this.uploadPath}/${this.userService.userID}/${this.file.name}`;
    this.storageRef = ref(this.storage, this.userSpecificPath);
  }


  /**
   * removes the file from the observable
   */
  removeImg(id: any) {
    this.noFileChosen();
    this.currentImg.next('');
    this.file = null;

    const fileInput = document.getElementById(id) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }


  noFileChosen() {
    this.channelFileChosen = false;
    this.threadFileChosen = false;
    this.dmFileChosen = false;
    this.newMessageFileChosen = false;
    this.file = null;
  }


  /**
   * uploads the file and sets the download URL
   */
  async uploadPicture() {
    await uploadBytes(this.storageRef, this.file).then(async (snapshot) => {
      this.downloadURL = await getDownloadURL(this.storageRef);
      this.currentImg.next('');
      this.noFileChosen();
    });
  }
}
