import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-investigations',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="feature-container">
      <header class="feature-header">
        <h2>Investigation Timeline & Audit Trail</h2>
        <span class="owner-tag">Owner: Anuj</span>
      </header>
      <p class="desc">Append-only chronological audit log of investigator decisions and status changes. (Table: <code>investigation_action</code>)</p>
      
      <div class="timeline">
        <div class="timeline-item">
          <div class="timeline-point"></div>
          <div class="timeline-content">
            <div class="timeline-meta">
              <span class="action-type">FLAG_FOR_FORENSICS</span>
              <span class="time">2 hours ago</span>
              <span class="user">By: Anuj Investigator</span>
            </div>
            <p class="explanation">Flagged image for EXIF inspection. Metadata reveals creation with Photoshop 25.1 rather than camera capture.</p>
            <div class="transition">Transition: <code>OPEN</code> &rarr; <code>INVESTIGATING</code></div>
          </div>
        </div>

        <div class="timeline-item">
          <div class="timeline-point"></div>
          <div class="timeline-content">
            <div class="timeline-meta">
              <span class="action-type">CROSS_REFERENCE_HISTORY</span>
              <span class="time">1 hour ago</span>
              <span class="user">By: Chinmay Analyst</span>
            </div>
            <p class="explanation">Queried national claims fraud registry. Claimant matches pattern associated with refurbished re-submission ring.</p>
            <div class="transition">Transition: <code>OPEN</code> &rarr; <code>INVESTIGATING</code></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .feature-container { padding: 1.5rem; color: #f3f4f6; }
    .feature-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem; }
    .feature-header h2 { margin: 0; color: #f9fafb; font-size: 1.5rem; }
    .owner-tag { background: #312e81; color: #c7d2fe; padding: 0.25rem 0.6rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
    .desc { color: #9ca3af; margin-bottom: 1.5rem; }
    .timeline { position: relative; border-left: 2px solid #374151; margin-left: 1rem; padding-left: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }
    .timeline-item { position: relative; }
    .timeline-point { position: absolute; left: -1.95rem; top: 0.35rem; width: 12px; height: 12px; border-radius: 50%; background: #3b82f6; border: 2px solid #111827; }
    .timeline-content { background: #111827; border: 1px solid #1f2937; border-radius: 8px; padding: 1rem 1.25rem; }
    .timeline-meta { display: flex; gap: 1rem; align-items: center; font-size: 0.85rem; margin-bottom: 0.5rem; }
    .action-type { font-weight: 700; color: #60a5fa; }
    .time { color: #9ca3af; }
    .user { color: #d1d5db; font-style: italic; }
    .explanation { margin: 0 0 0.5rem; color: #e5e7eb; font-size: 0.95rem; }
    .transition { font-size: 0.85rem; color: #9ca3af; }
    code { color: #f59e0b; background: #0f172a; padding: 0.15rem 0.4rem; border-radius: 4px; }
  `]
})
export class InvestigationsComponent {}
