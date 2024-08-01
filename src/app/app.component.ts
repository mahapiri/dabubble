import { Component } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { WorkspaceMenuComponent } from './shared/workspace-menu/workspace-menu.component';
import { ChannelComponent } from './channel/channel/channel.component';
import { MatIconRegistry } from '@angular/material/icon';
import { SignUpComponent } from './login/sign-up/sign-up.component';
import { LogInComponent } from './login/log-in/log-in.component';
import { HeaderComponent } from './shared/header/header.component';
import { ChooseAvatarComponent } from './login/choose-avatar/choose-avatar.component';
import { ResetPasswordComponent } from './login/reset-password/reset-password.component';
import { SendMailComponent } from './login/send-mail/send-mail.component';
import localeDe from '@angular/common/locales/de';

registerLocaleData(localeDe, 'de');

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    WorkspaceMenuComponent,
    ChannelComponent,
    SignUpComponent,
    LogInComponent,
    HeaderComponent,
    ChooseAvatarComponent,
    ResetPasswordComponent,
    SendMailComponent,
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
