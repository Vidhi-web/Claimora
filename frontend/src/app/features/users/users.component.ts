import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="feature-container">
      <header class="feature-header">
        <h2>User Management</h2>
        <span class="owner-tag">Owner: Vidhi</span>
      </header>
      <p class="desc">Manage administrator, investigator, and claims specialist accounts. (Table: <code>users</code>)</p>
      
      <div class="table-card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Vidhi Lead</td>
              <td>vidhi.admin&#64;claimora.internal</td>
              <td><span class="role-badge admin">ADMIN</span></td>
              <td><span class="status-badge active">ACTIVE</span></td>
            </tr>
            <tr>
              <td>2</td>
              <td>Anuj Investigator</td>
              <td>anuj.investigator&#64;claimora.internal</td>
              <td><span class="role-badge investigator">INVESTIGATOR</span></td>
              <td><span class="status-badge active">ACTIVE</span></td>
            </tr>
            <tr>
              <td>3</td>
              <td>Chinmay Analyst</td>
              <td>chinmay.analyst&#64;claimora.internal</td>
              <td><span class="role-badge investigator">INVESTIGATOR</span></td>
              <td><span class="status-badge active">ACTIVE</span></td>
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
    .role-badge { padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
    .role-badge.admin { background: #7c2d12; color: #fdba74; }
    .role-badge.investigator { background: #312e81; color: #c7d2fe; }
    .status-badge.active { background: #064e3b; color: #6ee7b7; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
  `]
})
export class UsersComponent {}
