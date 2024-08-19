import { inject, Injectable } from '@angular/core';
import { getDownloadURL, getStorage, ref, Storage, uploadBytes } from '@angular/fire/storage';
import { AuthService } from './auth.service';
import { BehaviorSubject } from 'rxjs';
import { UserService } from './user.service';


@Injectable({
  providedIn: 'root'
})
export class UploadService {
  storage: Storage = inject(Storage)
  authService: AuthService = inject(AuthService);
  userService: UserService = inject(UserService);


  acceptedFileTypes: string = '.jpg, .jpeg, .png, .pdf';
  file: any = "Datei hochladen";
  userSpecificPath: string = "";
  storageRef = ref(this.storage, this.userSpecificPath);
  downloadURL: string = ""
  fileChosen: boolean = false;

  public currentImg = new BehaviorSubject<string | ArrayBuffer | null>("");
  currentImg$ = this.currentImg.asObservable();


  constructor() {   }

  triggerFileInput(): void {
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onFileSelected(event: Event): void {
      const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.file = input.files[0];
      if (this.file.type.startsWith('image/') || this.file.type.startsWith('application/')) {
        const reader = new FileReader();
        reader.onload = () => {
          this.currentImg.next(reader.result);
          this.fileChosen = true;
          this.userSpecificPath = `/${this.userService.userID}/${this.file.name}`
          this.storageRef = ref(this.storage, this.userSpecificPath);
        };
        reader.readAsDataURL(this.file);
      } else {
        console.error('Die ausgewählte Datei ist kein Bild.');
      }
    }
  }

  removeImg(){
    this.fileChosen = false;
    this.currentImg.next("");   
  }

  async uploadPicture() {
    await uploadBytes(this.storageRef, this.file).then(async (snapshot) => {
      this.downloadURL = await getDownloadURL(this.storageRef);
      this.currentImg.next("");   
      this.fileChosen = false;
    })
  }
}
