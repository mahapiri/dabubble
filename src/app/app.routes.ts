import { Routes } from '@angular/router';
import { MainWindowComponent } from './main-window/main-window.component';
import { LogInComponent } from './login/log-in/log-in.component';
import { SignUpComponent } from './login/sign-up/sign-up.component';
import { ChooseAvatarComponent } from './login/choose-avatar/choose-avatar.component';
import { ResetPasswordComponent } from './login/reset-password/reset-password.component';
import { SendMailComponent } from './login/send-mail/send-mail.component';
import { ImprintComponent } from './imprint/imprint.component';

export const routes: Routes = [
    { path: '', component: LogInComponent},
    { path: 'log-in', component: LogInComponent},
    { path: 'main-window', component: MainWindowComponent },
    { path: 'sign-up', component: SignUpComponent },
    { path: 'choose-avatar', component: ChooseAvatarComponent },
    { path: 'reset-password', component: ResetPasswordComponent },
    { path: 'send-mail', component: SendMailComponent },
    { path: 'imprint', component: ImprintComponent },    
];
