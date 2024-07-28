import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

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
  userService: UserService = inject(UserService);

  constructor(private router: Router) {}
  
  openUser() {
    this.clickedUser = !this.clickedUser;
  }
  async logOut(event: Event){
    event.preventDefault();
    await this.authService.logOut();
    this.router.navigate(['/']);
  }




}
