import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { User } from '../../../models/user.class';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClickOutsideDirective } from '../../directive/click-outside.directive';
import { TaggingService } from '../../services/tagging.service';
import { BehaviorSubject } from 'rxjs';

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
  @Output() closePopup: EventEmitter<void> = new EventEmitter<void>();
  public taggingService: TaggingService = inject(TaggingService);


  searchText: string = '';

  searchMember() {

  }


  selectMember(member: User) {
    this.taggingService.selectMember(member);
    this.closeWindow();
  }

  closeWindow() {
    this.closePopup.emit();
  }
}
