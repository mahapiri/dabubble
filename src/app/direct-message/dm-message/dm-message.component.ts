import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardContent } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { OwnMessageComponent } from './own-message/own-message.component';
import { UserMessageComponent } from './user-message/user-message.component';

@Component({
  selector: 'app-dm-message',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatCardContent,
    OwnMessageComponent,
    UserMessageComponent
  ],
  templateUrl: './dm-message.component.html',
  styleUrl: './dm-message.component.scss'
})
export class DmMessageComponent {

}
