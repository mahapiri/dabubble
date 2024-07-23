import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  clickedUser: boolean = false; 
  authService: AuthService = inject(AuthService);
  
  openUser() {
    this.clickedUser = !this.clickedUser;
  }
  logOut(){
    this.authService.logOut();
  }




}
