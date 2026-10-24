import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'Claimora';
  sidebarCollapsed = signal(false);
  searchQuery = '';

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  onLogout(): void {
    this.authService.logout();
  }

  onSearch(event: Event): void {
    event.preventDefault();
    const q = this.searchQuery.trim();
    if (q) {
      this.router.navigate(['/claims'], { queryParams: { search: q } });
      this.searchQuery = '';
    }
  }

  getUserInitial(): string {
    const name = this.authService.currentUser()?.name;
    return name ? name.charAt(0).toUpperCase() : 'U';
  }
}
