import { inject, Injectable } from '@angular/core';
import { UserService } from './user.service';
import { collection, Firestore, getDocs } from '@angular/fire/firestore';
import { User } from '../../models/user.class';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private userService: UserService = inject(UserService);
  private firestore: Firestore = inject(Firestore);
  isProfile: boolean = false;
  isProfileID: string = '';
  profile: any;

  constructor() { }



  openProfile(userID: string) {
    this.isProfile = true;
    this.isProfileID = userID;
    this.getProfile(userID);
  }

  async getProfile(userID: string) {
    const docRef = collection(this.firestore, 'users');
    const userRef = await getDocs(docRef);
    
    userRef.forEach((doc) => {
      const data = doc.data();
      const id = data['userId'];

      if(id === userID) {
        // const user = {
        //   username: data['username'],
        //   userId: data['userId'],
        //   email: data['email'],
        //   state: data['state'],
        //   userChannels: data['userChannels'],
        //   profileImage: data['profileImage'],
        // };
        // this.profile = user;
        this.profile = data;
        console.log(this.profile)
      }
    })

  }
}
