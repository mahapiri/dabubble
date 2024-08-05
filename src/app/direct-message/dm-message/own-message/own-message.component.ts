import { Component, OnInit } from '@angular/core';
import { MatCardContent } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatList, MatListItem } from '@angular/material/list';
import { DmMessage } from '../../../../models/direct-message.class';
import { DirectMessageService } from '../../../services/direct-message.service';

@Component({
  selector: 'app-own-message',
  standalone: true,
  imports: [
    MatCardContent,
    MatListItem,
    MatList,
    MatDivider,
    MatIcon
  ],
  templateUrl: './own-message.component.html',
  styleUrl: './own-message.component.scss'
})
export class OwnMessageComponent implements OnInit {

  constructor(private directMessageService: DirectMessageService) {}

  ngOnInit() {

  }
}
