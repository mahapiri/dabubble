import { EventEmitter, inject, Injectable, OnInit } from '@angular/core';
import { UserService } from './user.service';
import { Firestore } from '@angular/fire/firestore';
import { User } from '../../models/user.class';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DirectMessageService implements OnInit {
  private firestore: Firestore = inject(Firestore);
  private userService: UserService = inject(UserService);
  private userSubject = new BehaviorSubject<User | null>(null);
  public userSelected$ = this.userSubject.asObservable();

  constructor() { }

  ngOnInit() {
  }

  getActualProfile(profile: User) {
    this.userSubject.next(profile);
  }
}
  