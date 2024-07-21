import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatDividerModule],
  templateUrl: './channel.component.html',
  styleUrl: './channel.component.scss',
})
export class ChannelComponent {}
