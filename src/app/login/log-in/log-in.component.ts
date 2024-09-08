import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from './../../services/auth.service';
import { collection, deleteDoc, doc, Firestore, getDocs, query, Timestamp, updateDoc, where } from '@angular/fire/firestore';
import { MatIcon } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { Auth, signInAnonymously } from '@angular/fire/auth';

@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [MatCardModule, ReactiveFormsModule, MatIcon, RouterLink, CommonModule],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.scss'
})
export class LogInComponent {
  formbuilder: FormBuilder = inject(FormBuilder);
  authService: AuthService = inject(AuthService);
  userService: UserService = inject(UserService)
  firestore: Firestore = inject(Firestore);
  email: string = "";
  mailerrorMessage: string = ""
  passworderrorMessage: string = ""
  invalidMail: boolean = false;
  invalidPassword: boolean = false;
  password: string = "";
  passwordVisible: boolean = false;
  constructor(private router: Router, private auth: Auth) { }


  userForm = this.formbuilder.group({
    userEmail: ["", Validators.required],
    userPassword: ["", Validators.required]
  })

  ngOnInit() {
    this.hideIntroScreen();
    this.checkForOldGuestUsers();
  }

  /**
   * gets the login credentials from the user-input and logs in the user, if the credentials are correct
   */
  async onSubmit() {
    this.email = this.userForm.value.userEmail || '';
    this.password = this.userForm.value.userPassword || '';
    this.invalidMail = false;
    this.invalidPassword = false;

    await this.authService
      .logInUser(this.email, this.password)
      .then(() => {
        this.userForm.reset();
        this.router.navigate(['/main-window']);
      })
      .catch((error) => {
        this.handleError(error.code)
      });
  }

  /**
   *  handles the error messages, if the user-credentials are incorrect
   * @param error
   */
  handleError(error: string) {
    if (error) {
      switch (error) {
        case 'auth/invalid-email':
          this.invalidMail = true;
          this.mailerrorMessage = "*Diese E-Mail-Adresse ist leider ungültig"
          break;
        case 'auth/user-not-found':
          this.invalidMail = true;
          this.mailerrorMessage = "Benutzer nicht gefunden"
          break;
        case 'auth/invalid-credential':
          this.invalidPassword = true;
          this.passworderrorMessage = "Falsches Passwort ... Bitte noch einmal versuchen. "
          break;
        case 'auth/missing-password':
          this.invalidPassword = true;
          this.passworderrorMessage = "Bitte geben Sie ein Passwort ein"
          break;
        default:
          console.error('An unknown error occurred:', error);
      }
    } else {
      console.error('An unexpected error occurred:', error);
    }
  }

  /**
   * hides the intro screen once its showed. The intro screen is only showed again when the page is reloaded
   */
  hideIntroScreen() {
    setTimeout(() => {
      this.authService.firstOpen = false;
    }, 5000);
  }

  /**
   * signs in with a guest account and saves the guest ID in the authService. It also sets the starting channel, creates a new User in the database
   *  and saves the time, the guest user was created
   */
  async logInAsGuest() {
    await signInAnonymously(this.auth).then((login) => {
      this.authService.userId = login.user.uid
      this.authService.loggedInAsGuest = true;
      this.userForm.reset();
    }
    )
    await this.authService.setStartingChannels();
    await this.authService.saveUserInDocument();
    await this.setCreationTime(this.authService.userId);
    this.router.navigate(['/main-window']);
  }

  /**
   * logs in the user with his google user credentials
   */
  async loginWithGoogle() {
    await this.authService.googleLogin().then(() => {
      this.userForm.reset();
      this.router.navigate(['/main-window']);
    })
  }

  /**
   * toggles the visibility of the password
   */
  showPassword() {
    this.passwordVisible = !this.passwordVisible;
  }

  /**
   * logs out the current user
   */
  logOutUser() {
    this.authService.logOut();
  }

  /**
 * updates the user in the database to store the time, the user was created
 * @param userId the id of the user
 */
  async setCreationTime(userId: string) {
    const guestRef = doc(this.firestore, "users", userId);
    await updateDoc(guestRef, {
      createdAt: Timestamp.now()
    });
  }

  /**
 * When guest users aren´t deleted correctly from the userlist and the userchannels, this function
 * deletes old guest users, when they are older than 24 hours
 */
  async checkForOldGuestUsers() {
    const q = query(collection(this.firestore, "users"), where("username", "==", "Gast"));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (user) => {
      const guestTimestamp = user.data()['createdAt']
      const userDocId = user.data()['userId']
      if (this.isOlderThanOneDay(guestTimestamp)) {
        await this.authService.deleteGuestFromAllChannels(userDocId);
        await deleteDoc(doc(this.firestore, "users", userDocId));
      }
    });
  }

  /**
 * checks if the user creation is older than 24 hours
 * @param storedTimestamp creation time of the user
 * @returns true if the user is older than 24 hours
 */
  isOlderThanOneDay(storedTimestamp: Timestamp): boolean {
    const currentTimestamp = Timestamp.now();
    const oneDayAgoTimestamp = Timestamp.fromMillis(currentTimestamp.toMillis() - (24 * 60 * 60 * 1000));
    return storedTimestamp.toMillis() < oneDayAgoTimestamp.toMillis();
  }
}
