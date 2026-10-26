import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
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
  isDashboardRoute = signal(false);
  searchQuery = '';

  constructor(
    public authService: AuthService,
    private router: Router
  ) {
    if (typeof window !== 'undefined') {
      this.checkRoute(window.location.pathname);
    }
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.checkRoute(event.urlAfterRedirects || event.url);
    });
  }

  private checkRoute(url: string): void {
    const cleanUrl = url.split('?')[0].split('#')[0];
    const isPublic = cleanUrl === '/' || cleanUrl === '' || cleanUrl.startsWith('/auth');
    this.isDashboardRoute.set(!isPublic);
  }

  isDashboardLayout(): boolean {
    return this.authService.isAuthenticated() && this.isDashboardRoute();
  }

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
