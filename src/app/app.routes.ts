import { Routes } from '@angular/router';
import { MainWindowComponent } from './main-window/main-window.component';
import { LogInComponent } from './login/log-in/log-in.component';

export const routes: Routes = [
    { path: '', component: LogInComponent},
    { path: 'main', component: MainWindowComponent },
];
