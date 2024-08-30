import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ClickOutsideDirective } from '../../directive/click-outside.directive';
import { user } from '@angular/fire/auth';

@Component({
  selector: 'app-new-message-header',
  standalone: true,
  imports: [
    MatCardModule,
    CommonModule,
    MatIconModule,
    FormsModule,
    ClickOutsideDirective
  ],
  templateUrl: './new-message-header.component.html',
  styleUrl: './new-message-header.component.scss'
})
export class NewMessageHeaderComponent {
  inputActive: boolean = false;
  usersearch: boolean = false;
  channelsearch: boolean = false;
  searchword: string = '';
  @Output() searchwordValue = new EventEmitter<string>();


  openResults() {
    this.inputActive = this.searchword.trim().length > 0;
    this.usersearch = this.searchword.startsWith('@');
    this.channelsearch = this.searchword.startsWith('#');
  }

  closeResults() {
    this.inputActive = false;
  }
}
