import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-new-message-header',
  standalone: true,
  imports: [
    MatCardModule,
    CommonModule
  ],
  templateUrl: './new-message-header.component.html',
  styleUrl: './new-message-header.component.scss'
})
export class NewMessageHeaderComponent {
  inputActive: boolean = false;


  startSearch() {
    this.inputActive = true;
  }
}
