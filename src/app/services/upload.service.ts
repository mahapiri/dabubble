import { inject, Injectable } from '@angular/core';
import { getDownloadURL, getStorage, ref, Storage, uploadBytes } from '@angular/fire/storage';
import { AuthService } from './auth.service';


@Injectable({
  providedIn: 'root'
})
export class UploadService {
  storage: Storage = inject(Storage)
  authService: AuthService = inject(AuthService);

  acceptedFileTypes: string = '.jpg, .jpeg, .png, .pdf';
  imageUrl: string | ArrayBuffer | null = "";
  file: any = "Datei hochladen";
  userSpecificPath: string = "";
  storageRef = ref(this.storage, this.userSpecificPath);
  downloadURL: string = ""


  constructor() { }
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
          this.imageUrl = reader.result;
          this.userSpecificPath = `channelUploads/${this.authService.userId}/${this.file.name}`
          this.storageRef = ref(this.storage, this.userSpecificPath);
        };
        reader.readAsDataURL(this.file);
      } else {
        console.error('Die ausgewählte Datei ist kein Bild.');
      }
    }
  }
/*
  async checkOwnPicture() {
    if (this.uploadOwnPicture) {
      this.userSpecificPath = `uploads/${this.authService.userId}/${this.file.name}`
      this.storageRef = ref(this.storage, this.userSpecificPath);
      await this.uploadPicture();
    }
  }
*/
  async uploadPicture() {
    await uploadBytes(this.storageRef, this.file).then(async (snapshot) => {
      this.downloadURL = await getDownloadURL(this.storageRef);
    })
  } 
}
