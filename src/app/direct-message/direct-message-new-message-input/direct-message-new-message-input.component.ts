import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-direct-message-new-message-input',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    FormsModule
  ],
  templateUrl: './direct-message-new-message-input.component.html',
  styleUrl: './direct-message-new-message-input.component.scss'
})
export class DirectMessageNewMessageInputComponent {
  messageText = false;

  // createMessage(messageInput.value, messageInput, profile) {

  // }
}
