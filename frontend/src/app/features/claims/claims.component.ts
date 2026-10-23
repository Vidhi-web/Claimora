import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-claims',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="feature-container">
      <header class="feature-header">
        <h2>Claims Operations & Intake</h2>
        <span class="owner-tag">Owner: Tanishka</span>
      </header>
      <p class="desc">Warranty claim intake, verification queue, and status lifecycle. (Table: <code>claim</code>)</p>
      
      <div class="table-card">
        <table>
          <thead>
            <tr>
              <th>Claim Number</th>
              <th>Product Model</th>
              <th>Claim Date</th>
              <th>Status</th>
              <th>Issue Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>CLM-2026-000101</code></td>
              <td>Dell XPS 15 9520</td>
              <td>2026-02-10</td>
              <td><span class="status-pill flagged">FLAGGED</span></td>
              <td>Screen flickering intermittently and blacking out under load.</td>
            </tr>
            <tr>
              <td><code>CLM-2026-000102</code></td>
              <td>Apple MacBook Pro 16</td>
              <td>2026-02-12</td>
              <td><span class="status-pill review">UNDER_REVIEW</span></td>
              <td>Battery draining within 45 minutes; overheating near port.</td>
            </tr>
            <tr>
              <td><code>CLM-2026-000104</code></td>
              <td>Sony WH-1000XM5</td>
              <td>2026-01-28</td>
              <td><span class="status-pill approved">APPROVED</span></td>
              <td>Right hinge detached from chassis due to fatigue.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .feature-container { padding: 1.5rem; color: #f3f4f6; }
    .feature-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem; }
    .feature-header h2 { margin: 0; color: #f9fafb; font-size: 1.5rem; }
    .owner-tag { background: #831843; color: #fbcfe8; padding: 0.25rem 0.6rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
    .desc { color: #9ca3af; margin-bottom: 1.5rem; }
    .table-card { background: #111827; border: 1px solid #1f2937; border-radius: 8px; overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid #1f2937; font-size: 0.9rem; }
    th { background: #1f2937; color: #9ca3af; }
    code { color: #38bdf8; background: #0f172a; padding: 0.2rem 0.4rem; border-radius: 4px; }
    .status-pill { padding: 0.2rem 0.55rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
    .status-pill.flagged { background: #7f1d1d; color: #fca5a5; }
    .status-pill.review { background: #78350f; color: #fcd34d; }
    .status-pill.approved { background: #064e3b; color: #6ee7b7; }
  `]
})
export class ClaimsComponent {}
