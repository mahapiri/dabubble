import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { User } from '../../../models/user.class';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.scss'
})
export class MyProfileComponent implements OnInit {
  @Input() clickedProfile: boolean = false;
  @Output() clickedProfileChange = new EventEmitter<boolean>();
  userService: UserService = inject(UserService);
  currentUser: User | null = null;

  constructor() {}

  async ngOnInit() {
   // await this.userService.getUserID();
    this.userService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  closeProfile() {
    this.clickedProfileChange.emit(false);
  }

  getStatusText(status: string | undefined): string {
    switch (status) {
      case 'online':
        return 'Online';
      case 'offline':
        return 'Offline';
      case 'absent':
        return 'Abwesend';
      default:
        return '';
    }
  }
}
