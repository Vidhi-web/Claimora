import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-findings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="feature-container">
      <header class="feature-header">
        <h2>Fraud Findings & Risk Engine</h2>
        <span class="owner-tag">Owner: Chinmay</span>
      </header>
      <p class="desc">Automated rule violations, anomaly detection findings, and risk scores. (Table: <code>finding</code>)</p>
      
      <div class="table-card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Rule Code</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td><code>RULE_IMAGE_TAMPER_DETECTED</code></td>
              <td><span class="severity critical">CRITICAL</span></td>
              <td><span class="status open">OPEN</span></td>
              <td>ELA detected altered pixels in receipt date and serial number area.</td>
            </tr>
            <tr>
              <td>2</td>
              <td><code>RULE_VELOCITY_HIGH_VALUE</code></td>
              <td><span class="severity medium">MEDIUM</span></td>
              <td><span class="status investigating">INVESTIGATING</span></td>
              <td>Claimant submitted 3 high-value hardware claims within 45 days.</td>
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
    .owner-tag { background: #1e3a8a; color: #93c5fd; padding: 0.25rem 0.6rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
    .desc { color: #9ca3af; margin-bottom: 1.5rem; }
    .table-card { background: #111827; border: 1px solid #1f2937; border-radius: 8px; overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid #1f2937; font-size: 0.9rem; }
    th { background: #1f2937; color: #9ca3af; }
    code { color: #38bdf8; background: #0f172a; padding: 0.2rem 0.4rem; border-radius: 4px; }
    .severity { padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700; }
    .severity.critical { background: #991b1b; color: #fecaca; }
    .severity.medium { background: #854d0e; color: #fef08a; }
    .status { padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
    .status.open { background: #374151; color: #e5e7eb; }
    .status.investigating { background: #1e3a8a; color: #bfdbfe; }
  `]
})
export class FindingsComponent {}
