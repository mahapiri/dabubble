import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { SharedService } from '../../services/shared.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  sharedService: SharedService = inject(SharedService);

  constructor() {
  }


  close() {
    this.sharedService.isProfile = false;
  }
}
