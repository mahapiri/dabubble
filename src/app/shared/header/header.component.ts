import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

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
  constructor(private router: Router) {}
  
  openUser() {
    this.clickedUser = !this.clickedUser;
  }
  logOut(event: Event){
    event.preventDefault();
    this.authService.logOut();
    this.router.navigate(['/']);
  }




}
