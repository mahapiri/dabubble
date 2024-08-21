import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
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
export class TaggingComponent implements OnInit {
  @Input() showUser: User[] = [];
  @Output() closePopup: EventEmitter<void> = new EventEmitter<void>();
  public taggingService: TaggingService = inject(TaggingService);


  searchText: string = '';
  filteredMembers: User[] = [];

  
  /**
  * get all user from current channel
  */
  ngOnInit() {
    this.filteredMembers = this.taggingService.currentChannelMember;
  }


  /**
  * search member to tag
  */
  searchMember() {
    if (this.searchText.trim() === '') {
      this.filteredMembers = this.taggingService.currentChannelMember;
    } else {
      const lowerSearchText = this.searchText.toLowerCase();
      this.filteredMembers = this.taggingService.currentChannelMember.filter((member: User) =>
        member.username.toLowerCase().includes(lowerSearchText)
      );
    }
  }


  /**
  * select a member and then close the popup window
  */
  selectMember(member: User) {
    this.taggingService.selectMember(member);
    this.closeWindow();
  }


  /**
  * close the popup window
  */
  closeWindow() {
    this.closePopup.emit();
  }
}
