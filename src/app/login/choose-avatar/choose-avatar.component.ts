import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { getDownloadURL, getStorage, ref, Storage, uploadBytes } from '@angular/fire/storage';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';


@Component({
  selector: 'app-choose-avatar',
  standalone: true,
  imports: [MatCardModule, MatIconModule, RouterLink, CommonModule],
  templateUrl: './choose-avatar.component.html',
  styleUrl: './choose-avatar.component.scss'
})
export class ChooseAvatarComponent {
  authService: AuthService = inject(AuthService)
  userService: UserService = inject(UserService)
  storage: Storage = inject(Storage)
  pictureChosen: boolean = false;
  uploadOwnPicture: boolean = false;
  file: any = "Datei hochladen";
  acceptedFileTypes: string = '.jpg, .jpeg, .png, .pdf';
  imageUrl: string | ArrayBuffer | null = "assets/img/character-empty.png";
  username: string = this.authService.username;
  userSpecificPath: string = "";
  storageRef = ref(this.storage, this.userSpecificPath);

  constructor(private router: Router) { }

  setPicture(src: string) {
    this.uploadOwnPicture = false;
    this.pictureChosen = true;
    this.imageUrl = src;
    this.authService.profileImage = src;
  }

  async createUser() {
    await this.authService.createUser();
    await this.checkOwnPicture()
    await this.authService.setStartingChannels();
    await this.authService.saveUserInDocument();
    this.pictureChosen = false;
    this.router.navigate(['/main-window']);
  }

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
      if (this.file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          this.imageUrl = reader.result;
          this.uploadOwnPicture = true;
        };
        reader.readAsDataURL(this.file);
        this.pictureChosen = true;
      } else {
        console.error('Die ausgewählte Datei ist kein Bild.');
      }
    }
  }

  async checkOwnPicture() {
    if (this.uploadOwnPicture) {
      this.userSpecificPath = `uploads/${this.authService.userId}/${this.file.name}`
      this.storageRef = ref(this.storage, this.userSpecificPath);
      await this.uploadPicture();
    }
  }

  async uploadPicture() {
    await uploadBytes(this.storageRef, this.file).then(async (snapshot) => {
      const downloadURL = await getDownloadURL(this.storageRef);
      this.authService.profileImage = downloadURL;
    })
  }

}

