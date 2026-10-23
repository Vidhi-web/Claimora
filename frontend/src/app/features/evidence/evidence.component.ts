import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-evidence',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="feature-container">
      <header class="feature-header">
        <h2>Evidence Documents & Digital Forensics</h2>
        <span class="owner-tag">Owner: Kalp</span>
      </header>
      <p class="desc">Uploaded receipts, photos, SHA-256 fingerprint deduplication. (Table: <code>evidence_document</code>)</p>
      
      <div class="table-card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>File Name</th>
              <th>SHA-256 Hash</th>
              <th>Extracted Highlights</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td><span class="badge">INVOICE</span></td>
              <td>invoice_clm101_electronic.pdf</td>
              <td><code>e3b0c442...7852b855</code></td>
              <td>Vendor: BestTech | Total: $1,899.99</td>
            </tr>
            <tr>
              <td>2</td>
              <td><span class="badge highlight">PHOTO_DAMAGE</span></td>
              <td>damage_screen_clm101.jpg</td>
              <td><code>4f53cda1...1202b945</code></td>
              <td>Tamper Detected: Yes (Score: 0.87)</td>
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
    .owner-tag { background: #065f46; color: #a7f3d0; padding: 0.25rem 0.6rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
    .desc { color: #9ca3af; margin-bottom: 1.5rem; }
    .table-card { background: #111827; border: 1px solid #1f2937; border-radius: 8px; overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid #1f2937; font-size: 0.9rem; }
    th { background: #1f2937; color: #9ca3af; }
    code { color: #38bdf8; background: #0f172a; padding: 0.2rem 0.4rem; border-radius: 4px; }
    .badge { padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; background: #374151; color: #e5e7eb; }
    .badge.highlight { background: #991b1b; color: #fecaca; }
  `]
})
export class EvidenceComponent {}
