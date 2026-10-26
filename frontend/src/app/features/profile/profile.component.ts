import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { UserService } from '../../services/user.service';
import { User, ChangePasswordRequest } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-container">
      <header class="page-header">
        <h2>Profile & Account Settings</h2>
        <p class="subtitle">Review your active credentials, assigned permissions, and update your password.</p>
      </header>

      <!-- Alerts -->
      <div *ngIf="successMessage()" class="alert-success">
        <span>✓ {{ successMessage() }}</span>
      </div>
      <div *ngIf="errorMessage()" class="alert-error">
        <span>⚠️ {{ errorMessage() }}</span>
      </div>

      <div class="cards-grid">
        <!-- User Profile Card -->
        <div class="card profile-info-card">
          <div class="card-header">
            <h3>Identity & Role Details</h3>
          </div>
          <div class="card-body">
            <div class="avatar-banner">
              <div class="user-avatar">
                {{ userInitials() }}
              </div>
              <div class="user-meta">
                <h4>{{ user()?.name }}</h4>
                <p>{{ user()?.email }}</p>
              </div>
            </div>

            <div class="detail-row">
              <span class="detail-label">Account ID:</span>
              <span class="detail-val">#{{ user()?.userId }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Assigned Role:</span>
              <span class="badge" [ngClass]="user()?.role?.toLowerCase() || ''">{{ user()?.role }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Account Status:</span>
              <span class="status-badge" [ngClass]="user()?.status?.toLowerCase() || ''">{{ user()?.status }}</span>
            </div>
            <div class="detail-row" *ngIf="user()?.createdAt">
              <span class="detail-label">Member Since:</span>
              <span class="detail-val">{{ user()?.createdAt | date:'mediumDate' }}</span>
            </div>
          </div>
        </div>

        <!-- Change Password Card -->
        <div class="card change-pw-card">
          <div class="card-header">
            <h3>Change Password</h3>
          </div>
          <div class="card-body">
            <form (ngSubmit)="onChangePassword()" #pwForm="ngForm">
              <div class="form-group">
                <label for="current-password">Current Password *</label>
                <div class="input-toggle-wrap">
                  <input
                    id="current-password"
                    [type]="showCurrentPw() ? 'text' : 'password'"
                    [(ngModel)]="pwModel.currentPassword"
                    name="currentPassword"
                    required
                    placeholder="••••••••••••"
                  />
                  <button type="button" class="btn-toggle" (click)="showCurrentPw.set(!showCurrentPw())">
                    {{ showCurrentPw() ? 'Hide' : 'Show' }}
                  </button>
                </div>
              </div>

              <div class="form-group">
                <label for="new-password">New Password * (min 8 chars, letter + number)</label>
                <div class="input-toggle-wrap">
                  <input
                    id="new-password"
                    [type]="showNewPw() ? 'text' : 'password'"
                    [(ngModel)]="pwModel.newPassword"
                    name="newPassword"
                    required
                    placeholder="••••••••••••"
                  />
                  <button type="button" class="btn-toggle" (click)="showNewPw.set(!showNewPw())">
                    {{ showNewPw() ? 'Hide' : 'Show' }}
                  </button>
                </div>
              </div>

              <div class="form-group">
                <label for="confirm-password">Confirm New Password *</label>
                <input
                  id="confirm-password"
                  type="password"
                  [(ngModel)]="confirmPassword"
                  name="confirmPassword"
                  required
                  placeholder="••••••••••••"
                />
                <span *ngIf="confirmPassword && pwModel.newPassword !== confirmPassword" class="field-error">
                  Passwords do not match
                </span>
              </div>

              <button
                type="submit"
                class="btn-primary"
                [disabled]="isSubmitting() || pwForm.invalid || pwModel.newPassword !== confirmPassword"
              >
                {{ isSubmitting() ? 'Updating Password...' : 'Update Password' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-container { padding: 1.5rem 0; color: #f3f4f6; }
    .page-header { margin-bottom: 1.5rem; }
    .page-header h2 { margin: 0 0 0.25rem; font-size: 1.5rem; color: #f9fafb; }
    .subtitle { margin: 0; color: #9ca3af; font-size: 0.9rem; }
    .cards-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 1.5rem; }
    .card { background: #111827; border: 1px solid #1f2937; border-radius: 10px; overflow: hidden; }
    .card-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid #1f2937; background: #182234; }
    .card-header h3 { margin: 0; font-size: 1.1rem; color: #f9fafb; }
    .card-body { padding: 1.5rem; }
    .avatar-banner { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; padding-bottom: 1.25rem; border-bottom: 1px solid #1f2937; }
    .user-avatar { width: 56px; height: 56px; border-radius: 50%; background: #2563eb; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; font-weight: 700; text-transform: uppercase; }
    .user-meta h4 { margin: 0 0 0.25rem; font-size: 1.15rem; color: #f9fafb; }
    .user-meta p { margin: 0; font-size: 0.85rem; color: #9ca3af; }
    .detail-row { display: flex; justify-content: space-between; align-items: center; padding: 0.65rem 0; border-bottom: 1px solid rgba(31, 41, 55, 0.6); }
    .detail-label { font-size: 0.85rem; color: #9ca3af; }
    .detail-val { font-size: 0.9rem; font-weight: 500; color: #f3f4f6; }
    .badge { padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700; }
    .badge.admin { background: #7c2d12; color: #fdba74; }
    .badge.investigator { background: #312e81; color: #c7d2fe; }
    .badge.staff { background: #064e3b; color: #6ee7b7; }
    .status-badge { padding: 0.2rem 0.5rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
    .status-badge.active { background: rgba(16, 185, 129, 0.2); color: #34d399; }
    .status-badge.inactive { background: rgba(107, 114, 128, 0.2); color: #9ca3af; }
    .form-group { margin-bottom: 1.15rem; display: flex; flex-direction: column; gap: 0.35rem; }
    .form-group label { font-size: 0.8rem; color: #d1d5db; font-weight: 500; }
    input { width: 100%; padding: 0.65rem 0.75rem; background: #1f2937; border: 1px solid #374151; border-radius: 6px; color: #f9fafb; font-size: 0.9rem; }
    input:focus { outline: none; border-color: #3b82f6; }
    .input-toggle-wrap { position: relative; display: flex; align-items: center; }
    .btn-toggle { position: absolute; right: 0.5rem; background: none; border: none; color: #9ca3af; font-size: 0.75rem; cursor: pointer; text-transform: uppercase; font-weight: 600; padding: 0.2rem 0.4rem; }
    .btn-toggle:hover { color: #f3f4f6; }
    .field-error { color: #f87171; font-size: 0.75rem; }
    .btn-primary { width: 100%; background: #2563eb; color: #ffffff; border: none; padding: 0.75rem; border-radius: 6px; font-weight: 600; cursor: pointer; margin-top: 0.5rem; }
    .btn-primary:hover:not(:disabled) { background: #1d4ed8; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .alert-success { background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; color: #6ee7b7; padding: 0.75rem 1rem; border-radius: 6px; margin-bottom: 1rem; font-size: 0.875rem; }
    .alert-error { background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; color: #fca5a5; padding: 0.75rem 1rem; border-radius: 6px; margin-bottom: 1rem; font-size: 0.875rem; }
  `]
})
export class ProfileComponent implements OnInit {
  user = signal<User | null>(null);
  userInitials = signal('U');

  pwModel: ChangePasswordRequest = {
    currentPassword: '',
    newPassword: ''
  };
  confirmPassword = '';

  showCurrentPw = signal(false);
  showNewPw = signal(false);
  isSubmitting = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const current = this.authService.currentUser();
    if (current) {
      this.setUser(current);
    } else {
      this.authService.fetchProfile().subscribe({
        next: (u) => {
          if (u) this.setUser(u);
        }
      });
    }
  }

  private setUser(u: User): void {
    this.user.set(u);
    const parts = (u.name || '').trim().split(' ');
    const initials = parts.map(p => p[0]).join('').slice(0, 2).toUpperCase();
    this.userInitials.set(initials || 'U');
    this.cdr.detectChanges();
  }

  onChangePassword(): void {
    if (this.pwModel.newPassword !== this.confirmPassword) {
      this.errorMessage.set('New passwords do not match');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.userService.changePassword(this.pwModel).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.successMessage.set(res.message || 'Password changed successfully');
        this.pwModel = { currentPassword: '', newPassword: '' };
        this.confirmPassword = '';
        window.setTimeout(() => this.successMessage.set(null), 4000);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to change password');
      }
    });
  }
}
