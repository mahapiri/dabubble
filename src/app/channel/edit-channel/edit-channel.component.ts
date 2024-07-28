import { Component, EventEmitter, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-edit-channel',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './edit-channel.component.html',
  styleUrl: './edit-channel.component.scss'
})
export class EditChannelComponent {
  editing: boolean = false;

  close() {

  }

  edit() {
    this.editing = !this.editing;
  }
}
