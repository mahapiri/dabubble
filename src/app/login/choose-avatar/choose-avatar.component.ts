import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { getStorage, ref, Storage, uploadBytes } from '@angular/fire/storage';
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
  pictureChosen: boolean = false;
  file: any = "Datei hochladen";
  acceptedFileTypes: string = '.jpg, .jpeg, .png, .pdf';
  imageUrl: string | ArrayBuffer | null = null;
  constructor(private router: Router) { }
  username: string = this.authService.username;
  storage: Storage = inject(Storage)
  userSpecificPath: string = "";
  storageRef = ref(this.storage, this.userSpecificPath);
  imgURL: string = "assets/img/character-empty.png";

  setPicture(src: string) {
    this.pictureChosen = true;
    this.imgURL = src;
    this.authService.profileImage = src;
  }

  async createUser() {
    await this.authService.createUser();
    this.userSpecificPath = `uploads/${this.authService.userId}/${this.file.name}`
    this.storageRef = ref(this.storage, this.userSpecificPath);
    this.uploadPicture();
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
          console.log(this.imageUrl);

        };
        reader.readAsDataURL(this.file);
        this.pictureChosen = true;
      } else {
        console.error('Die ausgewählte Datei ist kein Bild.');
      }
    }
  }

  uploadPicture() {
    uploadBytes(this.storageRef, this.file).then((snapshot) => {
      console.log('Uploaded a blob or file!: ', snapshot);
    })
  }


}
