import { Component } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-send-mail',
  standalone: true,
  imports: [MatCardModule, MatIconModule, ReactiveFormsModule],
  templateUrl: './send-mail.component.html',
  styleUrl: './send-mail.component.scss',
})
export class SendMailComponent {}
