import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-wrapper">
      <div class="auth-card">
        <div class="brand-header">
          <span class="shield-icon">🛡️</span>
          <h1>Claimora</h1>
          <p class="tagline">Warranty Claims & Fraud-Risk Analysis Platform</p>
        </div>

        <!-- Forgot Password Information View -->
        <div *ngIf="showForgotModal()" class="forgot-notice">
          <div class="notice-header">
            <h3>Password Recovery</h3>
            <button type="button" class="close-btn" (click)="showForgotModal.set(false)">&times;</button>
          </div>
          <p>For security, automated self-service resets are disabled.</p>
          <div class="admin-contact-box">
            <span class="contact-label">Please contact your Claimora System Administrator:</span>
            <a href="mailto:admin@claimora.internal" class="admin-email">admin&#64;claimora.internal</a>
          </div>
          <button type="button" class="btn-secondary" (click)="showForgotModal.set(false)">Back to Sign In</button>
        </div>

        <!-- Sign In Form View -->
        <div *ngIf="!showForgotModal()">
          <h2 class="form-title">Account Sign In</h2>
          <p class="form-subtitle">Enter your corporate credentials to continue</p>

          <!-- Error Alert Banner -->
          <div *ngIf="errorMessage()" class="alert-error" role="alert">
            <span class="alert-icon">⚠️</span>
            <span>{{ errorMessage() }}</span>
          </div>

          <!-- Session Expired Notification -->
          <div *ngIf="sessionExpired()" class="alert-info" role="status">
            <span>Your session has expired. Please log in again.</span>
          </div>

          <form (ngSubmit)="onLogin()" #loginForm="ngForm" class="auth-form">
            <div class="form-group">
              <label for="email">Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                [(ngModel)]="email"
                required
                email
                #emailInput="ngModel"
                placeholder="name@claimora.internal"
                [disabled]="isLoading()"
                autocomplete="email"
              />
              <span *ngIf="emailInput.invalid && (emailInput.dirty || emailInput.touched)" class="field-error">
                Please enter a valid email address
              </span>
            </div>

            <div class="form-group">
              <div class="label-row">
                <label for="password">Password</label>
                <button type="button" class="forgot-link" (click)="showForgotModal.set(true)">
                  Forgot password?
                </button>
              </div>
              <div class="password-input-wrapper">
                <input
                  id="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  name="password"
                  [(ngModel)]="password"
                  required
                  placeholder="••••••••••••"
                  [disabled]="isLoading()"
                  autocomplete="current-password"
                />
                <button
                  type="button"
                  class="toggle-pw-btn"
                  (click)="showPassword.set(!showPassword())"
                  [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'"
                >
                  {{ showPassword() ? 'Hide' : 'Show' }}
                </button>
              </div>
            </div>

            <button
              type="submit"
              class="btn-submit"
              [disabled]="isLoading() || loginForm.invalid"
            >
              <span *ngIf="isLoading()" class="spinner"></span>
              <span>{{ isLoading() ? 'Signing in...' : 'Sign In' }}</span>
            </button>
          </form>

          <div class="demo-hints">
            <span class="hints-title">Default Admin Seeder:</span>
            <code>admin&#64;claimora.internal</code> / <code>Admin123!</code>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      min-height: calc(100vh - 120px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
    }
    .auth-card {
      width: 100%;
      max-width: 440px;
      background: #111827;
      border: 1px solid #1f2937;
      border-radius: 12px;
      padding: 2.25rem;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
    }
    .brand-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .shield-icon {
      font-size: 2.5rem;
      display: inline-block;
      margin-bottom: 0.5rem;
    }
    .brand-header h1 {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 700;
      letter-spacing: -0.025em;
      background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .tagline {
      margin: 0.35rem 0 0;
      font-size: 0.8rem;
      color: #9ca3af;
    }
    .form-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0 0 0.25rem;
      color: #f9fafb;
    }
    .form-subtitle {
      font-size: 0.85rem;
      color: #9ca3af;
      margin: 0 0 1.5rem;
    }
    .alert-error {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid #ef4444;
      color: #fca5a5;
      padding: 0.75rem 1rem;
      border-radius: 6px;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1.25rem;
    }
    .alert-info {
      background: rgba(59, 130, 246, 0.15);
      border: 1px solid #3b82f6;
      color: #93c5fd;
      padding: 0.75rem 1rem;
      border-radius: 6px;
      font-size: 0.875rem;
      margin-bottom: 1.25rem;
    }
    .form-group {
      margin-bottom: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    label {
      font-size: 0.85rem;
      font-weight: 500;
      color: #d1d5db;
    }
    .label-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .forgot-link {
      background: none;
      border: none;
      color: #60a5fa;
      font-size: 0.8rem;
      cursor: pointer;
      padding: 0;
    }
    .forgot-link:hover {
      text-decoration: underline;
    }
    input {
      width: 100%;
      padding: 0.75rem 0.875rem;
      background: #1f2937;
      border: 1px solid #374151;
      border-radius: 6px;
      color: #ffffff;
      font-size: 0.95rem;
      transition: border-color 0.15s ease-in-out;
    }
    input:focus {
      outline: none;
      border-color: #3b82f6;
    }
    .password-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }
    .toggle-pw-btn {
      position: absolute;
      right: 0.75rem;
      background: none;
      border: none;
      color: #9ca3af;
      font-size: 0.75rem;
      cursor: pointer;
      text-transform: uppercase;
      font-weight: 600;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
    }
    .toggle-pw-btn:hover {
      color: #f3f4f6;
      background: #374151;
    }
    .field-error {
      color: #f87171;
      font-size: 0.75rem;
    }
    .btn-submit {
      width: 100%;
      padding: 0.75rem;
      background: #2563eb;
      color: #ffffff;
      border: none;
      border-radius: 6px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-top: 0.5rem;
      transition: background-color 0.15s ease-in-out;
    }
    .btn-submit:hover:not(:disabled) {
      background: #1d4ed8;
    }
    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #ffffff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .demo-hints {
      margin-top: 1.75rem;
      padding-top: 1.25rem;
      border-top: 1px solid #1f2937;
      font-size: 0.8rem;
      color: #9ca3af;
      text-align: center;
    }
    .demo-hints code {
      background: #1f2937;
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      color: #60a5fa;
    }
    .forgot-notice {
      background: #1f2937;
      border: 1px solid #374151;
      border-radius: 8px;
      padding: 1.5rem;
    }
    .notice-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .notice-header h3 {
      margin: 0;
      font-size: 1.15rem;
      color: #f9fafb;
    }
    .close-btn {
      background: none;
      border: none;
      color: #9ca3af;
      font-size: 1.5rem;
      cursor: pointer;
      line-height: 1;
    }
    .admin-contact-box {
      background: #111827;
      padding: 1rem;
      border-radius: 6px;
      margin: 1rem 0 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .contact-label {
      font-size: 0.8rem;
      color: #9ca3af;
    }
    .admin-email {
      color: #60a5fa;
      font-size: 0.95rem;
      font-weight: 600;
      text-decoration: none;
    }
    .btn-secondary {
      width: 100%;
      padding: 0.65rem;
      background: #374151;
      color: #ffffff;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
    }
    .btn-secondary:hover {
      background: #4b5563;
    }
  `]
})
export class AuthComponent {
  email = '';
  password = '';
  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  showForgotModal = signal(false);
  sessionExpired = signal(false);

  private returnUrl = '/dashboard';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    this.sessionExpired.set(this.route.snapshot.queryParams['sessionExpired'] === 'true');
  }

  onLogin(): void {
    if (!this.email || !this.password) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = err.error?.message || err.message || 'Invalid email or password';
        this.errorMessage.set(msg);
      }
    });
  }
}
