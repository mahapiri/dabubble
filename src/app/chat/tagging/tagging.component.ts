import { Component, EventEmitter, Input, Output } from '@angular/core';
import { User } from '../../../models/user.class';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClickOutsideDirective } from '../../directive/click-outside.directive';

@Component({
  selector: 'app-tagging',
  standalone: true,
  imports: [
    MatIconModule,
    CommonModule,
    FormsModule,
    ClickOutsideDirective
  ],
  templateUrl: './tagging.component.html',
  styleUrl: './tagging.component.scss'
})
export class TaggingComponent {
  @Input() showUser: User[] = [];
  @Output() memberSelected: EventEmitter<User> = new EventEmitter<User>();
  @Output() closePopup: EventEmitter<void> = new EventEmitter<void>();

  searchMember: string = '';


  showMember() {
  }


  selectMember(member: User) {
    this.memberSelected.emit(member);
  }

  closeWindow() {
    this.closePopup.emit();
  }
}
