import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <header class="page-header">
        <h1>Fraud Risk & Warranty Operations Dashboard</h1>
        <p class="subtitle">Platform: Claimora | Integration & Shared Platform Overview</p>
      </header>

      <div class="metrics-grid">
        <div class="metric-card">
          <span class="label">Total Active Claims</span>
          <span class="value">128</span>
          <span class="trend positive">+12% this week</span>
        </div>
        <div class="metric-card warning">
          <span class="label">Flagged for Fraud</span>
          <span class="value">14</span>
          <span class="trend highlight">High Triage Priority</span>
        </div>
        <div class="metric-card critical">
          <span class="label">Critical Findings</span>
          <span class="value">6</span>
          <span class="trend alert">Image Tampering / Velocity</span>
        </div>
        <div class="metric-card">
          <span class="label">Avg Investigation Time</span>
          <span class="value">1.8d</span>
          <span class="trend positive">-25% vs target</span>
        </div>
      </div>

      <div class="modules-overview">
        <h2>Module Ownership & Architecture Matrix</h2>
        <div class="ownership-table">
          <table>
            <thead>
              <tr>
                <th>Entity / Feature</th>
                <th>Owner</th>
                <th>Database Table</th>
                <th>Responsibility</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Users & Auth</strong></td>
                <td>Vidhi</td>
                <td><code>users</code></td>
                <td>User auth, role enforcement, security guards & JWT</td>
              </tr>
              <tr>
                <td><strong>Product Catalog</strong></td>
                <td>Shaili</td>
                <td><code>product</code></td>
                <td>Serial registry, warranty period checks</td>
              </tr>
              <tr>
                <td><strong>Claims Intake</strong></td>
                <td>Tanishka</td>
                <td><code>claim</code></td>
                <td>Warranty claim intake, status lifecycle</td>
              </tr>
              <tr>
                <td><strong>Evidence Documents</strong></td>
                <td>Kalp</td>
                <td><code>evidence_document</code></td>
                <td>Invoices, photos, SHA-256 fingerprinting</td>
              </tr>
              <tr>
                <td><strong>Findings & Analysis</strong></td>
                <td>Chinmay</td>
                <td><code>finding</code></td>
                <td>Automated fraud rules, anomaly detection</td>
              </tr>
              <tr>
                <td><strong>Investigation Actions</strong></td>
                <td>Anuj</td>
                <td><code>investigation_action</code></td>
                <td>Append-only investigator audit timeline</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 1.5rem; color: #f3f4f6; }
    .page-header h1 { font-size: 1.75rem; margin: 0 0 0.25rem; color: #f9fafb; }
    .subtitle { color: #9ca3af; margin: 0 0 2rem; }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2.5rem;
    }
    .metric-card {
      background: #111827;
      border: 1px solid #1f2937;
      border-radius: 10px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .metric-card.warning { border-color: rgba(245, 158, 11, 0.4); }
    .metric-card.critical { border-color: rgba(239, 68, 68, 0.4); }
    .metric-card .label { font-size: 0.85rem; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; }
    .metric-card .value { font-size: 2rem; font-weight: 700; color: #f9fafb; }
    .metric-card .trend { font-size: 0.8rem; }
    .metric-card .positive { color: #10b981; }
    .metric-card .highlight { color: #f59e0b; }
    .metric-card .alert { color: #ef4444; }
    .modules-overview h2 { font-size: 1.25rem; color: #e5e7eb; margin-bottom: 1rem; }
    .ownership-table table {
      width: 100%;
      border-collapse: collapse;
      background: #111827;
      border: 1px solid #1f2937;
      border-radius: 8px;
      overflow: hidden;
    }
    th, td { padding: 0.875rem 1rem; text-align: left; border-bottom: 1px solid #1f2937; }
    th { background: #1f2937; font-size: 0.85rem; color: #9ca3af; text-transform: uppercase; }
    td { font-size: 0.9rem; color: #d1d5db; }
    code { background: #374151; padding: 0.2rem 0.4rem; border-radius: 4px; font-size: 0.85rem; color: #60a5fa; }
  `]
})
export class DashboardComponent {}
