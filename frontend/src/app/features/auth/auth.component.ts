import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-card">
      <div class="auth-header">
        <h2>Sign In to Claimora</h2>
        <p>Owner: Vidhi (User + Authentication)</p>
      </div>
      <form class="auth-form" (ngSubmit)="onLogin()">
        <div class="form-group">
          <label for="email">Corporate Email</label>
          <input id="email" type="email" [(ngModel)]="email" name="email" placeholder="name@claimora.internal" required />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input id="password" type="password" [(ngModel)]="password" name="password" placeholder="••••••••••••" required />
        </div>
        <button type="submit" class="btn-primary">Authenticate</button>
      </form>
    </div>
  `,
  styles: [`
    .auth-card {
      max-width: 440px;
      margin: 4rem auto;
      background: #111827;
      border: 1px solid #1f2937;
      border-radius: 12px;
      padding: 2.5rem;
      color: #f3f4f6;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
    }
    .auth-header h2 { margin: 0 0 0.5rem; font-size: 1.5rem; color: #60a5fa; }
    .auth-header p { margin: 0 0 1.5rem; font-size: 0.85rem; color: #9ca3af; }
    .form-group { margin-bottom: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; }
    label { font-size: 0.875rem; color: #d1d5db; }
    input {
      padding: 0.75rem 1rem;
      background: #1f2937;
      border: 1px solid #374151;
      border-radius: 6px;
      color: #ffffff;
      font-size: 0.95rem;
    }
    input:focus { outline: none; border-color: #3b82f6; }
    .btn-primary {
      width: 100%;
      padding: 0.75rem;
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 0.5rem;
      transition: background 0.2s;
    }
    .btn-primary:hover { background: #1d4ed8; }
  `]
})
export class AuthComponent {
  email = '';
  password = '';

  onLogin(): void {
    console.log('Login attempt for:', this.email);
  }
}
