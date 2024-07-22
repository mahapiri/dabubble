import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { WorkspaceMenuComponent } from './shared/workspace-menu/workspace-menu.component';
import { ChannelComponent } from './main-board/channel/channel.component';
import { MatIconRegistry } from '@angular/material/icon';
import { SignUpComponent } from './login/sign-up/sign-up.component';
import { LogInComponent } from './login/log-in/log-in.component';
import { HeaderComponent } from './shared/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    WorkspaceMenuComponent,
    ChannelComponent, SignUpComponent, LogInComponent,
    HeaderComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'dabubble';

  constructor(private matIconReg: MatIconRegistry) {}

  ngOnInit(): void {
    this.matIconReg.setDefaultFontSetClass('material-symbols-rounded');
  }
}
