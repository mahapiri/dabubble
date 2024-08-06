import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Channel } from '../../../models/channel.class';

@Component({
  selector: 'app-edit-channel',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './edit-channel.component.html',
  styleUrl: './edit-channel.component.scss'
})
export class EditChannelComponent {
  editing: boolean = false;
  @Input() channel!: Channel;


  close() {

  }

  edit() {
    this.editing = !this.editing;
  }
}
