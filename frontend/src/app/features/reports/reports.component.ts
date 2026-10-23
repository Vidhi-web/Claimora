import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="feature-container">
      <header class="feature-header">
        <h2>Reports & Fraud Analytics</h2>
        <span class="owner-tag">Integration & Reporting</span>
      </header>
      <p class="desc">Loss prevention metrics, recovery audit logs, and fraud trends over time.</p>
      
      <div class="cards-grid">
        <div class="report-card">
          <h3>Fraud Prevention Savings</h3>
          <p class="stat">$42,850</p>
          <p class="note">Identified and mitigated across 14 fraudulent claims this quarter.</p>
        </div>
        <div class="report-card">
          <h3>Top Detected Anomaly</h3>
          <p class="stat">Tampered Invoices</p>
          <p class="note">67% of high-severity findings triggered by pixel or EXIF inconsistencies.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .feature-container { padding: 1.5rem; color: #f3f4f6; }
    .feature-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem; }
    .feature-header h2 { margin: 0; color: #f9fafb; font-size: 1.5rem; }
    .owner-tag { background: #374151; color: #d1d5db; padding: 0.25rem 0.6rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
    .desc { color: #9ca3af; margin-bottom: 1.5rem; }
    .cards-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; }
    .report-card { background: #111827; border: 1px solid #1f2937; border-radius: 8px; padding: 1.5rem; }
    .report-card h3 { margin: 0 0 0.5rem; font-size: 1rem; color: #9ca3af; }
    .report-card .stat { font-size: 1.75rem; font-weight: 700; color: #10b981; margin: 0 0 0.5rem; }
    .report-card .note { font-size: 0.85rem; color: #9ca3af; margin: 0; }
  `]
})
export class ReportsComponent {}
