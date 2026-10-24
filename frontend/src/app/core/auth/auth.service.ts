import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { LoginRequest, LoginResponse, User, Role } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl = '/api/auth';
  private readonly SESSION_TOKEN_KEY = 'claimora_session_token';
  private readonly SESSION_USER_KEY = 'claimora_session_user';

  // Token in memory plus sessionStorage for persistence across page refreshes
  private tokenInMemory: string | null = null;

  readonly currentUser = signal<User | null>(null);
  readonly isAuthenticated = computed(() => !!this.getToken() && !!this.currentUser());
  readonly isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');
  readonly isInvestigator = computed(() => this.currentUser()?.role === 'INVESTIGATOR');
  readonly isStaff = computed(() => this.currentUser()?.role === 'STAFF');

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.restoreSession();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, credentials).pipe(
      tap(response => {
        this.setSession(response.token, response.user);
      })
    );
  }

  logout(): void {
    this.tokenInMemory = null;
    sessionStorage.removeItem(this.SESSION_TOKEN_KEY);
    sessionStorage.removeItem(this.SESSION_USER_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    if (this.tokenInMemory) {
      return this.tokenInMemory;
    }
    const sessionToken = sessionStorage.getItem(this.SESSION_TOKEN_KEY);
    if (sessionToken) {
      this.tokenInMemory = sessionToken;
      return sessionToken;
    }
    return null;
  }

  hasRole(allowedRoles: Role[] | Role): boolean {
    const user = this.currentUser();
    if (!user) return false;
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    return roles.includes(user.role);
  }

  fetchProfile(): Observable<User | null> {
    const token = this.getToken();
    if (!token) {
      return of(null);
    }
    return this.http.get<User>(`${this.baseUrl}/me`).pipe(
      tap(user => {
        this.currentUser.set(user);
        sessionStorage.setItem(this.SESSION_USER_KEY, JSON.stringify(user));
      }),
      catchError(() => {
        this.logout();
        return of(null);
      })
    );
  }

  private setSession(token: string, user: User): void {
    this.tokenInMemory = token;
    sessionStorage.setItem(this.SESSION_TOKEN_KEY, token);
    sessionStorage.setItem(this.SESSION_USER_KEY, JSON.stringify(user));
    this.currentUser.set(user);
  }

  private restoreSession(): void {
    const token = sessionStorage.getItem(this.SESSION_TOKEN_KEY);
    const userJson = sessionStorage.getItem(this.SESSION_USER_KEY);

    if (token && userJson) {
      try {
        this.tokenInMemory = token;
        const user = JSON.parse(userJson) as User;
        this.currentUser.set(user);
      } catch {
        this.logout();
      }
    }
  }
}
