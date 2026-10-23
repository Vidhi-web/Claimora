import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="feature-container">
      <header class="feature-header">
        <h2>Product & Warranty Registry</h2>
        <span class="owner-tag">Owner: Shaili</span>
      </header>
      <p class="desc">Covered products, serial numbers, and validity periods. (Table: <code>product</code>)</p>
      
      <div class="table-card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Serial Number</th>
              <th>Model</th>
              <th>Purchase Date</th>
              <th>Warranty Coverage</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td><code>SN-XPS15-9520-4821</code></td>
              <td>Dell XPS 15 9520</td>
              <td>2025-01-15</td>
              <td>2025-01-15 to 2027-01-15</td>
            </tr>
            <tr>
              <td>2</td>
              <td><code>SN-APL-MBP16-9932</code></td>
              <td>Apple MacBook Pro 16 M3</td>
              <td>2024-06-10</td>
              <td>2024-06-10 to 2025-06-10</td>
            </tr>
            <tr>
              <td>3</td>
              <td><code>SN-SMS-S24U-10294</code></td>
              <td>Samsung Galaxy S24 Ultra</td>
              <td>2025-03-01</td>
              <td>2025-03-01 to 2026-03-01</td>
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
    .owner-tag { background: #701a75; color: #f5d0fe; padding: 0.25rem 0.6rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
    .desc { color: #9ca3af; margin-bottom: 1.5rem; }
    .table-card { background: #111827; border: 1px solid #1f2937; border-radius: 8px; overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid #1f2937; font-size: 0.9rem; }
    th { background: #1f2937; color: #9ca3af; }
    code { color: #38bdf8; background: #0f172a; padding: 0.2rem 0.4rem; border-radius: 4px; }
  `]
})
export class ProductsComponent {}
