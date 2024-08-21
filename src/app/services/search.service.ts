import { inject, Injectable, OnInit } from '@angular/core';
import { UserService } from './user.service';
import { User } from '../../models/user.class';

@Injectable({
  providedIn: 'root'
})
export class SearchService implements OnInit {
  private userService: UserService = inject(UserService);

  userList: User[] = [];

  constructor() { 
    this.userService.userList$.subscribe((user) =>  {
      this.userList = user;
    });
  }

  ngOnInit() {
  }
}
