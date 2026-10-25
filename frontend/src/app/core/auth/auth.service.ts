import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { LoginRequest, LoginResponse, User, Role } from '../../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = '/api/auth';
  private readonly TOKEN_KEY = 'claimora_token';
  private readonly USER_KEY  = 'claimora_user';

  private readonly tokenSignal = signal<string | null>(null);
  readonly currentUser     = signal<User | null>(null);
  readonly isAuthenticated = computed(() => !!this.tokenSignal() && !!this.currentUser());
  readonly isAdmin         = computed(() => this.currentUser()?.role === 'ADMIN');
  readonly isInvestigator  = computed(() => this.currentUser()?.role === 'INVESTIGATOR');
  readonly isStaff         = computed(() => this.currentUser()?.role === 'STAFF');

  constructor(private http: HttpClient, private router: Router) {
    this.restoreSession();
  }

  getToken(): string | null { return this.tokenSignal(); }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, credentials).pipe(
      tap(res => this.setSession(res.token, res.user))
    );
  }

  logout(): void {
    this.tokenSignal.set(null);
    this.currentUser.set(null);
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.router.navigate(['/auth/login']);
  }

  hasRole(allowedRoles: Role[] | Role): boolean {
    const user = this.currentUser();
    if (!user) return false;
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    return roles.includes(user.role);
  }

  fetchProfile(): Observable<User | null> {
    if (!this.tokenSignal()) return of(null);
    return this.http.get<User>(`${this.baseUrl}/me`).pipe(
      tap(user => {
        this.currentUser.set(user);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      }),
      catchError(() => { this.logout(); return of(null); })
    );
  }

  private setSession(token: string, user: User): void {
    this.tokenSignal.set(token);
    this.currentUser.set(user);
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private restoreSession(): void {
    const token    = localStorage.getItem(this.TOKEN_KEY);
    const userJson = localStorage.getItem(this.USER_KEY);
    if (!token || !userJson) return;
    try {
      // Decode JWT payload and check expiry client-side
      const payload    = JSON.parse(atob(token.split('.')[1]));
      const nowSeconds = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < nowSeconds) {
        // Already expired — clear and force re-login
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        return;
      }
      this.tokenSignal.set(token);
      this.currentUser.set(JSON.parse(userJson) as User);
    } catch {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
  }
}