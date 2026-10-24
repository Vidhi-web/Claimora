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
<div class="auth-page">

  <!-- ── Left Panel: Branding / Feature Highlights ── -->
  <div class="auth-left" aria-hidden="true">
    <div class="auth-left-inner">

      <!-- Logo -->
      <div class="auth-logo">
        <div class="auth-logo-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L4 6v6c0 5.5 3.4 10.7 8 12 4.6-1.3 8-6.5 8-12V6L12 2z"
                  fill="#3b82f6" fill-opacity="0.25"
                  stroke="#3b82f6" stroke-width="1.75" stroke-linejoin="round"/>
            <path d="M9 12l2 2 4-4" stroke="#3b82f6" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="auth-logo-text">
          <span class="auth-logo-name">Claimora</span>
          <span class="auth-logo-tag">Enterprise</span>
        </div>
      </div>

      <!-- Hero -->
      <div class="auth-hero">
        <h1 class="auth-hero-title">Warranty Investigation &amp; Fraud Risk Platform</h1>
        <p class="auth-hero-sub">
          Centralised evidence management, rule-based anomaly detection, and
          full investigator audit trails — built for enterprise warranty operations.
        </p>
      </div>

      <!-- Feature pills -->
      <div class="auth-features">
        <div class="auth-feature-item">
          <span class="feature-icon">🔍</span>
          <span>Automated fraud-rule engine with configurable thresholds</span>
        </div>
        <div class="auth-feature-item">
          <span class="feature-icon">📎</span>
          <span>SHA-256 evidence fingerprinting and OCR correction history</span>
        </div>
        <div class="auth-feature-item">
          <span class="feature-icon">📊</span>
          <span>Real-time KPI dashboard and executive reporting</span>
        </div>
        <div class="auth-feature-item">
          <span class="feature-icon">🔒</span>
          <span>Role-based access control: Admin, Investigator, Staff</span>
        </div>
      </div>

      <!-- Footer note -->
      <p class="auth-left-footer">
        © 2024 Claimora · Secure internal platform · All rights reserved
      </p>
    </div>
  </div>

  <!-- ── Right Panel: Sign-In Form ── -->
  <div class="auth-right">
    <div class="auth-form-card">

      <!-- Mobile logo (shown only on small screens) -->
      <div class="auth-mobile-logo">
        <div class="auth-logo-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L4 6v6c0 5.5 3.4 10.7 8 12 4.6-1.3 8-6.5 8-12V6L12 2z"
                  fill="#3b82f6" fill-opacity="0.2"
                  stroke="#3b82f6" stroke-width="1.75" stroke-linejoin="round"/>
            <path d="M9 12l2 2 4-4" stroke="#3b82f6" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="auth-logo-name" style="font-size:1.25rem">Claimora</span>
      </div>

      <!-- ── FORGOT PASSWORD VIEW ── -->
      <div *ngIf="showForgotModal()" class="forgot-view">
        <button class="back-btn" type="button" (click)="showForgotModal.set(false)">
          ← Back to Sign In
        </button>
        <h2 class="form-heading">Password Recovery</h2>
        <p class="form-subheading">
          Automated password resets are disabled for security. Please contact your
          system administrator to reset your credentials.
        </p>
        <div class="contact-box">
          <div class="contact-box-label">Contact your admin at:</div>
          <a href="mailto:admin@claimora.internal" class="contact-email">
            admin&#64;claimora.internal
          </a>
        </div>
        <button type="button" class="btn-primary-full" (click)="showForgotModal.set(false)">
          Back to Sign In
        </button>
      </div>

      <!-- ── SIGN IN FORM VIEW ── -->
      <div *ngIf="!showForgotModal()">
        <h2 class="form-heading">Sign in to your account</h2>
        <p class="form-subheading">Enter your corporate credentials to continue</p>

        <!-- Error Banner -->
        <div *ngIf="errorMessage()" class="form-alert form-alert-error" role="alert" id="auth-error-banner">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
          <span>{{ errorMessage() }}</span>
        </div>

        <!-- Session Expired Banner -->
        <div *ngIf="sessionExpired()" class="form-alert form-alert-info" role="status" id="auth-session-expired">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
          </svg>
          <span>Your session has expired. Please sign in again.</span>
        </div>

        <!-- Form -->
        <form id="signin-form" (ngSubmit)="onLogin()" #loginForm="ngForm" class="signin-form" novalidate>

          <!-- Email -->
          <div class="field-group">
            <label class="field-label" for="email">Email Address</label>
            <div class="input-wrapper" [class.input-error]="emailInput.invalid && (emailInput.dirty || emailInput.touched)">
              <svg class="input-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
              </svg>
              <input
                id="email"
                type="email"
                name="email"
                class="field-input"
                [(ngModel)]="email"
                required
                email
                #emailInput="ngModel"
                placeholder="name@claimora.internal"
                [disabled]="isLoading()"
                autocomplete="email"
                autocapitalize="off"
                autocorrect="off"
                spellcheck="false"
              />
            </div>
            <span *ngIf="emailInput.invalid && (emailInput.dirty || emailInput.touched)"
                  class="field-error-msg" id="email-error">
              Please enter a valid email address.
            </span>
          </div>

          <!-- Password -->
          <div class="field-group">
            <div class="field-label-row">
              <label class="field-label" for="password">Password</label>
              <button type="button" class="forgot-link" id="forgot-password-btn"
                      (click)="showForgotModal.set(true)">
                Forgot password?
              </button>
            </div>
            <div class="input-wrapper password-wrapper">
              <svg class="input-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
              </svg>
              <input
                id="password"
                [type]="showPassword() ? 'text' : 'password'"
                name="password"
                class="field-input"
                [(ngModel)]="password"
                required
                minlength="6"
                placeholder="••••••••"
                [disabled]="isLoading()"
                autocomplete="current-password"
              />
              <button
                type="button"
                class="toggle-pw"
                id="toggle-password-visibility"
                (click)="showPassword.set(!showPassword())"
                [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'"
              >
                <!-- Eye icon (show) -->
                <svg *ngIf="!showPassword()" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                  <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
                </svg>
                <!-- Eye-off icon (hide) -->
                <svg *ngIf="showPassword()" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd"/>
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            id="signin-submit-btn"
            type="submit"
            class="btn-primary-full"
            [disabled]="isLoading() || loginForm.invalid"
          >
            <span *ngIf="isLoading()" class="btn-spinner" aria-hidden="true"></span>
            <svg *ngIf="!isLoading()" width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd"/>
            </svg>
            {{ isLoading() ? 'Signing in...' : 'Sign In' }}
          </button>

        </form>

        <!-- Demo Hint -->
        <div class="demo-hint" id="auth-demo-hint">
          <span class="demo-hint-label">Default Admin:</span>
          <code>admin&#64;claimora.internal</code>
          &nbsp;/&nbsp;
          <code>Admin123!</code>
        </div>

      </div>
    </div>
  </div>

</div>
  `,
  styles: [`
    /* ── Full-page layout: left branding | right form ── */
    .auth-page {
      display: flex;
      min-height: 100vh;
      background: #f1f5f9;
    }

    /* ══════════════════════════════════════════
       LEFT PANEL  (dark navy, branding)
       ══════════════════════════════════════════ */
    .auth-left {
      width: 46%;
      min-height: 100vh;
      background: #0f172a;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3rem 3.5rem;
      position: relative;
      overflow: hidden;
    }

    /* Subtle background grid decoration */
    .auth-left::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(rgba(59,130,246,.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(59,130,246,.04) 1px, transparent 1px);
      background-size: 48px 48px;
    }

    /* Glow blob */
    .auth-left::after {
      content: '';
      position: absolute;
      top: -20%;
      left: -10%;
      width: 80%;
      height: 80%;
      background: radial-gradient(circle, rgba(37,99,235,.15) 0%, transparent 60%);
      pointer-events: none;
    }

    .auth-left-inner {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      gap: 2rem;
      max-width: 440px;
      width: 100%;
    }

    /* Logo */
    .auth-logo {
      display: flex;
      align-items: center;
      gap: .75rem;
    }
    .auth-logo-icon {
      width: 44px; height: 44px;
      background: rgba(59,130,246,.12);
      border: 1px solid rgba(59,130,246,.2);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
    }
    .auth-logo-text { display: flex; flex-direction: column; }
    .auth-logo-name {
      font-size: 1.25rem; font-weight: 700;
      color: #ffffff; letter-spacing: -.02em; line-height: 1.2;
    }
    .auth-logo-tag {
      font-size: .65rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: .08em; color: #3b82f6;
    }

    /* Hero text */
    .auth-hero-title {
      font-size: 1.75rem; font-weight: 700;
      color: #f8fafc; line-height: 1.25;
      letter-spacing: -.025em; margin: 0;
    }
    .auth-hero-sub {
      font-size: .9rem; color: #94a3b8; line-height: 1.65; margin: .75rem 0 0;
    }

    /* Feature pills */
    .auth-features { display: flex; flex-direction: column; gap: .875rem; }
    .auth-feature-item {
      display: flex; align-items: flex-start; gap: .75rem;
      font-size: .85rem; color: #cbd5e1; line-height: 1.5;
    }
    .feature-icon { font-size: 1rem; flex-shrink: 0; margin-top: .05rem; }

    /* Footer */
    .auth-left-footer { font-size: .75rem; color: #475569; margin: 0; }

    /* ══════════════════════════════════════════
       RIGHT PANEL  (light, form)
       ══════════════════════════════════════════ */
    .auth-right {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2.5rem 2rem;
      background: #f1f5f9;
    }

    .auth-form-card {
      width: 100%;
      max-width: 400px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 2.25rem;
      box-shadow: 0 4px 6px rgba(0,0,0,.05), 0 1px 3px rgba(0,0,0,.07);
    }

    /* Mobile logo (hidden on desktop) */
    .auth-mobile-logo {
      display: none;
      align-items: center;
      gap: .625rem;
      margin-bottom: 1.75rem;
    }
    @media (max-width: 768px) { .auth-mobile-logo { display: flex; } }

    /* Headings */
    .form-heading {
      font-size: 1.25rem;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -.02em;
      margin: 0 0 .35rem;
    }
    .form-subheading {
      font-size: .8125rem;
      color: #64748b;
      margin: 0 0 1.5rem;
      line-height: 1.5;
    }

    /* Alert banners */
    .form-alert {
      display: flex; align-items: flex-start; gap: .5rem;
      padding: .75rem 1rem;
      border-radius: 8px;
      font-size: .8125rem;
      margin-bottom: 1.25rem;
      line-height: 1.5;
    }
    .form-alert svg { flex-shrink: 0; margin-top: .05rem; }
    .form-alert-error {
      background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c;
    }
    .form-alert-info {
      background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8;
    }

    /* Form structure */
    .signin-form { display: flex; flex-direction: column; gap: 1.125rem; }

    .field-group { display: flex; flex-direction: column; gap: .375rem; }

    .field-label {
      font-size: .8125rem; font-weight: 600; color: #374151;
    }
    .field-label-row {
      display: flex; justify-content: space-between; align-items: center;
    }

    /* Input wrapper with icon */
    .input-wrapper {
      display: flex; align-items: center;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      background: #ffffff;
      transition: border-color .15s, box-shadow .15s;
      overflow: hidden;
    }
    .input-wrapper:focus-within {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37,99,235,.12);
    }
    .input-wrapper.input-error { border-color: #ef4444; }
    .input-wrapper.input-error:focus-within { box-shadow: 0 0 0 3px rgba(239,68,68,.12); }

    .input-icon {
      color: #9ca3af;
      flex-shrink: 0;
      margin-left: .75rem;
    }

    .field-input {
      flex: 1;
      border: none;
      background: transparent;
      padding: .625rem .75rem;
      color: #0f172a;
      font-family: inherit;
      font-size: .875rem;
      outline: none;
      width: 100%;
    }
    .field-input::placeholder { color: #9ca3af; }
    .field-input:disabled { opacity: .6; cursor: not-allowed; }

    .field-error-msg { font-size: .75rem; color: #dc2626; }

    /* Password wrapper */
    .password-wrapper { position: relative; }
    .toggle-pw {
      background: transparent; border: none;
      color: #9ca3af; cursor: pointer;
      padding: .5rem .75rem;
      display: flex; align-items: center;
      flex-shrink: 0;
      transition: color .15s;
    }
    .toggle-pw:hover { color: #374151; }

    /* Forgot password link */
    .forgot-link {
      background: none; border: none;
      color: #2563eb; font-size: .8rem; font-weight: 500;
      cursor: pointer; padding: 0;
      font-family: inherit;
      transition: color .15s;
    }
    .forgot-link:hover { color: #1d4ed8; text-decoration: underline; }

    /* Primary submit button */
    .btn-primary-full {
      width: 100%;
      display: flex; align-items: center; justify-content: center; gap: .5rem;
      padding: .7rem 1rem;
      background: #2563eb;
      color: #ffffff;
      border: none; border-radius: 8px;
      font-family: inherit; font-size: .9375rem; font-weight: 600;
      cursor: pointer;
      transition: background .15s, transform .1s, box-shadow .15s;
      margin-top: .375rem;
      box-shadow: 0 1px 2px rgba(0,0,0,.1);
    }
    .btn-primary-full:hover:not(:disabled) {
      background: #1d4ed8;
      box-shadow: 0 4px 12px rgba(37,99,235,.35);
    }
    .btn-primary-full:active:not(:disabled) { transform: translateY(1px); }
    .btn-primary-full:disabled { opacity: .6; cursor: not-allowed; }

    /* Button spinner */
    .btn-spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,.35);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin .7s linear infinite;
      flex-shrink: 0;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Demo hint */
    .demo-hint {
      margin-top: 1.5rem;
      padding-top: 1.25rem;
      border-top: 1px solid #f1f5f9;
      font-size: .75rem;
      color: #94a3b8;
      text-align: center;
    }
    .demo-hint-label { font-weight: 600; margin-right: .25rem; }
    .demo-hint code {
      font-family: 'JetBrains Mono', monospace;
      background: #f1f5f9;
      color: #2563eb;
      padding: .1rem .4rem;
      border-radius: 4px;
      font-size: .75rem;
    }

    /* ── Forgot password panel inside the card ── */
    .forgot-view { display: flex; flex-direction: column; gap: 1rem; }
    .back-btn {
      background: none; border: none;
      color: #2563eb; font-size: .8125rem; font-weight: 500;
      cursor: pointer; padding: 0; font-family: inherit;
      align-self: flex-start;
    }
    .back-btn:hover { text-decoration: underline; }
    .contact-box {
      background: #f8fafc; border: 1px solid #e2e8f0;
      border-radius: 8px; padding: 1rem;
      display: flex; flex-direction: column; gap: .375rem;
    }
    .contact-box-label { font-size: .75rem; color: #64748b; }
    .contact-email {
      font-size: .9375rem; font-weight: 600; color: #2563eb;
      text-decoration: none;
    }
    .contact-email:hover { text-decoration: underline; }

    /* ── Responsive ── */
    @media (max-width: 768px) {
      .auth-left { display: none; }
      .auth-page { background: #f1f5f9; }
      .auth-right { padding: 1.5rem 1rem; }
      .auth-form-card { padding: 1.75rem 1.5rem; }
    }
  `]
})
export class AuthComponent {
  email = '';
  password = '';
  showPassword    = signal(false);
  isLoading       = signal(false);
  errorMessage    = signal<string | null>(null);
  showForgotModal = signal(false);
  sessionExpired  = signal(false);

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
    if (!this.email?.trim() || !this.password) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.login({ email: this.email.trim(), password: this.password }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = err?.error?.message
          || (err?.status === 401 ? 'Invalid email or password. Please try again.' : null)
          || err?.message
          || 'Sign in failed. Please check your credentials and try again.';
        this.errorMessage.set(msg);
      }
    });
  }
}
