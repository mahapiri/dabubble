import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { WorkspaceMenuComponent } from '../shared/workspace-menu/workspace-menu.component';
import { DirectMessageService } from '../services/direct-message.service';
import { User } from '../../models/user.class';
import { UserService } from '../services/user.service';
@Component({
  selector: 'app-direct-message',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    MatInputModule,
    MatListModule,
    CommonModule,
    WorkspaceMenuComponent
  ],
  templateUrl: './direct-message.component.html',
  styleUrl: './direct-message.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DirectMessageComponent implements OnInit {
  private directMessageService : DirectMessageService = inject(DirectMessageService);
  public userService : UserService = inject(UserService);
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  profile: User | null = null;

  constructor() {
    
  }

  ngOnInit() {
      this.directMessageService.userSelected$.subscribe((user) => {
        this.profile = user;
        console.log(this.profile?.userId)
        this.cdr.markForCheck();
      })
  }
}
