import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-create-channel',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './create-channel.component.html',
  styleUrl: './create-channel.component.scss'
})
export class CreateChannelComponent {
  @Output() clickedChannel = new EventEmitter<boolean>();

  close() {
    this.clickedChannel.emit(false);
  }
}
