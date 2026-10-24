import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvestigationService } from '../../services/investigation.service';
import { InvestigationAction, ActionType } from '../../models/investigation.model';

@Component({
  selector: 'app-investigations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <!-- Page Header -->
      <header class="page-header">
        <div>
          <div class="badge-tag">Forensic Audit Trail</div>
          <h1>Investigation Lifecycle & Audit Trail</h1>
          <p class="subtitle">Strict append-only chain of custody. Every alert has evidence. Every correction has a history. Every resolution has a reason.</p>
        </div>
      </header>

      <!-- Integrity Banner -->
      <div class="claimora-card integrity-banner">
        <div class="shield-icon">🛡️</div>
        <div class="integrity-text">
          <strong>Cryptographically Guaranteed Immutability</strong>
          <p>Investigation actions are permanent records. Updates (PUT, PATCH) and deletions (DELETE) on audit logs are strictly rejected with HTTP 405 Method Not Allowed by backend security enforcement.</p>
        </div>
      </div>

      <!-- Filter Toolbar -->
      <div class="claimora-card toolbar-card">
        <div class="filter-tabs">
          <span class="filter-label">Action Filter:</span>
          <button class="tab-btn" [class.active]="selectedType === undefined" (click)="setTypeFilter(undefined)">All Actions</button>
          <button class="tab-btn" [class.active]="selectedType === 'RESOLVE'" (click)="setTypeFilter('RESOLVE')">Resolutions</button>
          <button class="tab-btn" [class.active]="selectedType === 'DISMISS'" (click)="setTypeFilter('DISMISS')">Dismissals</button>
          <button class="tab-btn" [class.active]="selectedType === 'STATUS_CHANGE'" (click)="setTypeFilter('STATUS_CHANGE')">Status Changes</button>
          <button class="tab-btn" [class.active]="selectedType === 'CORRECT_VALUE'" (click)="setTypeFilter('CORRECT_VALUE')">OCR Corrections</button>
          <button class="tab-btn" [class.active]="selectedType === 'COMMENT'" (click)="setTypeFilter('COMMENT')">Notes</button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <span>Loading investigation audit trail...</span>
      </div>

      <!-- Audit Timeline Feed -->
      <div *ngIf="!loading" class="timeline-container">
        <div *ngIf="filteredActions.length > 0; else noActions" class="timeline-stream">
          <div *ngFor="let act of filteredActions" class="claimora-card timeline-card">
            <div class="action-header">
              <div class="action-type-box">
                <span class="action-pill" [ngClass]="act.actionType.toLowerCase()">{{ act.actionType }}</span>
                <span class="finding-link">Finding #{{ act.findingId }}</span>
              </div>
              <div class="action-time">
                {{ act.actionTime | date:'medium' }}
              </div>
            </div>

            <div class="action-author">
              <span class="author-avatar">{{ act.userName ? act.userName.charAt(0).toUpperCase() : 'U' }}</span>
              <div class="author-info">
                <span class="author-name">{{ act.userName || 'Investigator' }}</span>
                <span class="author-email">{{ act.userEmail || 'investigator@claimora.internal' }}</span>
              </div>
            </div>

            <div class="explanation-quote">
              <span class="quote-mark">“</span>
              <p class="quote-text">{{ act.explanation }}</p>
            </div>

            <div class="state-transition-strip" *ngIf="act.previousStatus || act.newStatus">
              <span class="strip-label">Finding Status State:</span>
              <span class="status-badge" [ngClass]="act.previousStatus ? act.previousStatus.toLowerCase() : 'none'">{{ act.previousStatus || 'N/A' }}</span>
              <span class="arrow">&rarr;</span>
              <span class="status-badge" [ngClass]="act.newStatus.toLowerCase()">{{ act.newStatus }}</span>
            </div>
          </div>
        </div>

        <ng-template #noActions>
          <div class="empty-state claimora-card">
            <div class="empty-icon">📝</div>
            <h3>No Investigation Actions Logged</h3>
            <p>No actions match the selected filter criteria.</p>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 2rem;
      max-width: 1100px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .badge-tag {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 700;
      color: #10b981;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 0.2rem 0.6rem;
      border-radius: var(--radius-full);
      margin-bottom: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .subtitle {
      color: var(--text-muted);
      margin-top: 0.25rem;
      font-size: 0.95rem;
    }

    .integrity-banner {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%);
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 1.25rem;
    }

    .shield-icon {
      font-size: 2.2rem;
    }

    .integrity-text strong {
      display: block;
      color: #6ee7b7;
      font-size: 0.95rem;
      margin-bottom: 0.2rem;
    }

    .integrity-text p {
      margin: 0;
      font-size: 0.85rem;
      color: var(--text-muted);
      line-height: 1.4;
    }

    .toolbar-card {
      padding: 0.85rem 1.25rem;
    }

    .filter-tabs {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      flex-wrap: wrap;
    }

    .filter-label {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--text-dim);
      margin-right: 0.4rem;
      text-transform: uppercase;
    }

    .tab-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      padding: 0.35rem 0.75rem;
      font-size: 0.8rem;
      font-weight: 600;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .tab-btn:hover {
      color: var(--text-main);
    }

    .tab-btn.active {
      background: #2563eb;
      color: #ffffff;
    }

    .timeline-stream {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .timeline-card {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      padding: 1.25rem;
      position: relative;
    }

    .action-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .action-type-box {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .action-pill {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.2rem 0.6rem;
      border-radius: 4px;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .action-pill.resolve {
      background: rgba(16, 185, 129, 0.15);
      color: #6ee7b7;
      border: 1px solid rgba(16, 185, 129, 0.4);
    }

    .action-pill.dismiss {
      background: rgba(100, 116, 139, 0.15);
      color: #cbd5e1;
      border: 1px solid rgba(100, 116, 139, 0.4);
    }

    .action-pill.status_change {
      background: rgba(59, 130, 246, 0.15);
      color: #93c5fd;
      border: 1px solid rgba(59, 130, 246, 0.4);
    }

    .action-pill.correct_value {
      background: rgba(245, 158, 11, 0.15);
      color: #fde047;
      border: 1px solid rgba(245, 158, 11, 0.4);
    }

    .action-pill.comment {
      background: rgba(168, 85, 247, 0.15);
      color: #d8b4fe;
      border: 1px solid rgba(168, 85, 247, 0.4);
    }

    .action-pill.request_evidence {
      background: rgba(236, 72, 153, 0.15);
      color: #f472b6;
      border: 1px solid rgba(236, 72, 153, 0.4);
    }

    .finding-link {
      font-size: 0.8rem;
      font-weight: 600;
      color: #60a5fa;
      background: #0d131f;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
    }

    .action-time {
      font-size: 0.75rem;
      color: var(--text-dim);
    }

    .action-author {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .author-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #1e293b;
      border: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.8rem;
      color: #38bdf8;
    }

    .author-info {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
    }

    .author-name {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-main);
    }

    .author-email {
      font-size: 0.75rem;
      color: var(--text-dim);
    }

    .explanation-quote {
      background: #0d131f;
      border-left: 3px solid #3b82f6;
      border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
      padding: 0.75rem 1rem;
      position: relative;
    }

    .quote-mark {
      position: absolute;
      top: -2px;
      left: 6px;
      font-size: 1.5rem;
      color: #3b82f6;
      opacity: 0.4;
      line-height: 1;
    }

    .quote-text {
      margin: 0;
      font-size: 0.9rem;
      color: var(--text-main);
      line-height: 1.5;
      padding-left: 0.75rem;
    }

    .state-transition-strip {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8rem;
      color: var(--text-dim);
      padding-top: 0.5rem;
      border-top: 1px solid var(--border-subtle);
    }

    .strip-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      font-weight: 600;
    }

    .status-badge {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
      text-transform: uppercase;
    }

    .status-badge.open {
      background: rgba(59, 130, 246, 0.15);
      color: #93c5fd;
    }

    .status-badge.under_investigation {
      background: rgba(245, 158, 11, 0.15);
      color: #fde047;
    }

    .status-badge.resolved {
      background: rgba(16, 185, 129, 0.15);
      color: #6ee7b7;
    }

    .status-badge.dismissed {
      background: rgba(100, 116, 139, 0.15);
      color: #cbd5e1;
    }

    .arrow {
      color: var(--text-dim);
    }

    .empty-state {
      padding: 4rem 2rem;
      text-align: center;
      color: var(--text-muted);
    }

    .empty-icon {
      font-size: 2.5rem;
    }

    .loading-state {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 3rem;
      color: var(--text-muted);
    }
  `]
})
export class InvestigationsComponent implements OnInit {
  actions: InvestigationAction[] = [];
  selectedType: ActionType | undefined = undefined;
  loading = false;

  constructor(private investigationService: InvestigationService) {}

  ngOnInit(): void {
    this.loadActions();
  }

  loadActions(): void {
    this.loading = true;
    this.investigationService.getAllActions().subscribe({
      next: (acts) => {
        this.actions = acts;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  setTypeFilter(type: ActionType | undefined): void {
    this.selectedType = type;
  }

  get filteredActions(): InvestigationAction[] {
    if (!this.selectedType) {
      return this.actions;
    }
    return this.actions.filter(a => a.actionType === this.selectedType);
  }
}
