import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../core/auth/auth.service';
import { DashboardStatsResponse } from '../../models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-page">
      <!-- Header -->
      <div class="dashboard-header">
        <div>
          <h1 id="dashboard-title">Operations & Fraud Risk Dashboard</h1>
          <p class="dashboard-subtitle">
            Welcome back, <strong>{{ authService.currentUser()?.name }}</strong>. Real-time warranty claims intelligence and anomaly monitoring.
          </p>
        </div>
        <div class="header-actions">
          <a routerLink="/claims" class="btn btn-secondary btn-sm">View Claims</a>
          <a routerLink="/reports" class="btn btn-primary btn-sm">Executive Report</a>
        </div>
      </div>

      <!-- Loading / Error States -->
      <div *ngIf="isLoading" class="loading-state">
        <div class="spinner"></div>
        <span>Aggregating platform intelligence...</span>
      </div>

      <div *ngIf="errorMessage" class="error-banner">
        <span>⚠️ {{ errorMessage }}</span>
        <button class="btn btn-sm btn-secondary" (click)="loadStats()">Retry</button>
      </div>

      <!-- Dashboard Content -->
      <div *ngIf="!isLoading && stats" class="dashboard-content">
        <!-- Top KPI Grid -->
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-label">Total Claims</span>
              <span class="kpi-icon">📋</span>
            </div>
            <div class="kpi-value">{{ stats.claimMetrics.totalClaims }}</div>
            <div class="kpi-sub">
              <span>{{ stats.claimMetrics.submitted }} Submitted</span>
              <span class="dot">•</span>
              <span>{{ stats.claimMetrics.underReview }} Under Review</span>
            </div>
          </div>

          <div class="kpi-card warning-glow">
            <div class="kpi-header">
              <span class="kpi-label">Flagged for Fraud</span>
              <span class="kpi-icon">🚨</span>
            </div>
            <div class="kpi-value text-danger">{{ stats.claimMetrics.flagged }}</div>
            <div class="kpi-sub">
              <span class="fraud-rate-badge">{{ stats.claimMetrics.fraudRatePercentage }}% Anomaly Rate</span>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-label">Active Findings</span>
              <span class="kpi-icon">🔍</span>
            </div>
            <div class="kpi-value">{{ stats.findingMetrics.open + stats.findingMetrics.underInvestigation }}</div>
            <div class="kpi-sub">
              <span class="badge-danger">{{ stats.findingMetrics.highSeverity }} High</span>
              <span class="badge-warning">{{ stats.findingMetrics.mediumSeverity }} Med</span>
              <span class="badge-success">{{ stats.findingMetrics.lowSeverity }} Low</span>
            </div>
          </div>

          <div class="kpi-card success-glow">
            <div class="kpi-header">
              <span class="kpi-label">Resolved Claims</span>
              <span class="kpi-icon">✅</span>
            </div>
            <div class="kpi-value text-success">{{ stats.claimMetrics.resolved }}</div>
            <div class="kpi-sub">
              <span>{{ stats.findingMetrics.resolved }} Findings Resolved</span>
            </div>
          </div>
        </div>

        <!-- Two Column Main Grid -->
        <div class="main-grid">
          <!-- Left: Top Triggered Fraud Rules -->
          <div class="claimora-card panel">
            <div class="panel-header">
              <h2>Top Triggered Fraud Rules</h2>
              <span class="panel-badge">Rule Engine Analysis</span>
            </div>
            <p class="panel-desc">Anomaly frequencies detected across warranty submissions and evidence cross-references.</p>

            <div *ngIf="stats.topTriggeredRules.length === 0" class="empty-list">
              No automated rule violations recorded yet.
            </div>

            <div class="rules-list" *ngIf="stats.topTriggeredRules.length > 0">
              <div *ngFor="let rule of stats.topTriggeredRules" class="rule-item">
                <div class="rule-info">
                  <div class="rule-title-row">
                    <span class="rule-name">{{ rule.ruleName }}</span>
                    <span class="rule-count">{{ rule.count }} {{ rule.count === 1 ? 'alert' : 'alerts' }}</span>
                  </div>
                  <div class="rule-code"><code>{{ rule.ruleCode }}</code></div>
                  <div class="progress-bar-bg">
                    <div class="progress-bar-fill" [style.width.%]="getRulePercentage(rule.count)"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Recent Investigation Activity Timeline -->
          <div class="claimora-card panel">
            <div class="panel-header">
              <h2>Investigation Audit Trail</h2>
              <a routerLink="/investigations" class="panel-link">Full Timeline &rarr;</a>
            </div>
            <p class="panel-desc">Append-only chronological log of investigator decisions and status transitions.</p>

            <div *ngIf="stats.recentActivities.length === 0" class="empty-list">
              No investigation actions recorded yet.
            </div>

            <div class="timeline" *ngIf="stats.recentActivities.length > 0">
              <div *ngFor="let act of stats.recentActivities" class="timeline-item">
                <div class="timeline-dot" [ngClass]="act.actionType.toLowerCase()"></div>
                <div class="timeline-content">
                  <div class="timeline-meta">
                    <span class="timeline-user">{{ act.userName || 'Investigator' }}</span>
                    <span class="timeline-action-badge" [ngClass]="act.actionType.toLowerCase()">
                      {{ act.actionType.replace('_', ' ') }}
                    </span>
                    <span class="timeline-time">{{ act.actionTime | date:'short' }}</span>
                  </div>
                  <div class="timeline-exp">{{ act.explanation }}</div>
                  <div *ngIf="act.previousStatus !== act.newStatus" class="timeline-transition">
                    <span class="status-chip">{{ act.previousStatus }}</span>
                    <span class="arrow">&rarr;</span>
                    <span class="status-chip highlight">{{ act.newStatus }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- System & Catalog Bar -->
        <div class="system-stats-bar claimora-card">
          <div class="system-stat">
            <span class="stat-num">{{ stats.systemMetrics.totalProducts }}</span>
            <span class="stat-text">Registered Products in Warranty Catalog</span>
          </div>
          <div class="stat-divider"></div>
          <div class="system-stat">
            <span class="stat-num">{{ stats.systemMetrics.totalEvidenceDocuments }}</span>
            <span class="stat-text">Evidence Documents Fingerprinted (SHA-256)</span>
          </div>
          <div class="stat-divider"></div>
          <div class="system-stat">
            <span class="stat-num text-warning">{{ stats.systemMetrics.manualOcrCorrections }}</span>
            <span class="stat-text">Manual OCR Corrections with Audit History</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page { display: flex; flex-direction: column; gap: 1.5rem; }
    .dashboard-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap; }
    .dashboard-header h1 { font-size: 1.75rem; color: #f8fafc; margin-bottom: 0.35rem; }
    .dashboard-subtitle { color: #94a3b8; font-size: 0.95rem; margin: 0; }
    .header-actions { display: flex; gap: 0.65rem; }

    .loading-state { display: flex; align-items: center; justify-content: center; gap: 0.75rem; padding: 4rem; color: #94a3b8; font-size: 1rem; }
    .error-banner { background: var(--danger-bg); border: 1px solid var(--danger-border); color: #fca5a5; padding: 1rem 1.25rem; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center; }

    /* KPI Grid */
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; }
    .kpi-card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; box-shadow: var(--shadow-sm); transition: transform 0.15s, border-color 0.15s; }
    .kpi-card:hover { transform: translateY(-2px); border-color: rgba(59, 130, 246, 0.4); }
    .kpi-card.warning-glow { border-color: rgba(239, 68, 68, 0.4); }
    .kpi-card.success-glow { border-color: rgba(16, 185, 129, 0.4); }
    .kpi-header { display: flex; justify-content: space-between; align-items: center; }
    .kpi-label { font-size: 0.8rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
    .kpi-icon { font-size: 1.25rem; }
    .kpi-value { font-size: 2.25rem; font-weight: 800; color: #f8fafc; line-height: 1.1; }
    .kpi-sub { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; color: #94a3b8; flex-wrap: wrap; }
    .dot { color: #475569; }
    .text-danger { color: #f87171 !important; }
    .text-success { color: #34d399 !important; }
    .text-warning { color: #fbbf24 !important; }
    .fraud-rate-badge { background: var(--danger-bg); color: #fca5a5; padding: 0.15rem 0.45rem; border-radius: 4px; font-weight: 600; font-size: 0.75rem; border: 1px solid var(--danger-border); }
    .badge-danger { background: var(--danger-bg); color: #f87171; padding: 0.1rem 0.35rem; border-radius: 3px; font-weight: 600; }
    .badge-warning { background: var(--warning-bg); color: #fbbf24; padding: 0.1rem 0.35rem; border-radius: 3px; font-weight: 600; }
    .badge-success { background: var(--success-bg); color: #34d399; padding: 0.1rem 0.35rem; border-radius: 3px; font-weight: 600; }

    /* Main Two-Column Grid */
    .main-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(420px, 1fr)); gap: 1.25rem; }
    .panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem; }
    .panel-header h2 { font-size: 1.2rem; color: #f8fafc; }
    .panel-badge { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; background: #1e293b; color: #94a3b8; padding: 0.2rem 0.5rem; border-radius: 4px; }
    .panel-link { font-size: 0.85rem; color: #60a5fa; text-decoration: none; font-weight: 600; }
    .panel-link:hover { text-decoration: underline; }
    .panel-desc { font-size: 0.85rem; color: #94a3b8; margin: 0 0 1.25rem; }
    .empty-list { color: #64748b; font-size: 0.9rem; font-style: italic; padding: 2rem 0; text-align: center; }

    /* Rules List */
    .rules-list { display: flex; flex-direction: column; gap: 1rem; }
    .rule-item { display: flex; flex-direction: column; gap: 0.35rem; background: var(--bg-elevated); padding: 0.85rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); }
    .rule-title-row { display: flex; justify-content: space-between; align-items: center; }
    .rule-name { font-weight: 600; font-size: 0.9rem; color: #f1f5f9; }
    .rule-count { font-size: 0.8rem; font-weight: 700; color: #f87171; background: var(--danger-bg); padding: 0.15rem 0.45rem; border-radius: 4px; border: 1px solid var(--danger-border); }
    .rule-code code { font-size: 0.75rem; color: #38bdf8; background: #0f172a; padding: 0.15rem 0.4rem; border-radius: 3px; }
    .progress-bar-bg { width: 100%; height: 6px; background: #1f293d; border-radius: 9999px; overflow: hidden; margin-top: 0.4rem; }
    .progress-bar-fill { height: 100%; background: linear-gradient(90deg, #3b82f6 0%, #ef4444 100%); border-radius: 9999px; transition: width 0.4s ease; }

    /* Timeline */
    .timeline { display: flex; flex-direction: column; gap: 1rem; border-left: 2px solid #1f2937; padding-left: 1rem; margin-left: 0.5rem; }
    .timeline-item { position: relative; display: flex; flex-direction: column; gap: 0.35rem; }
    .timeline-dot { position: absolute; left: -1.45rem; top: 0.25rem; width: 12px; height: 12px; border-radius: 50%; background: #3b82f6; border: 2px solid #111827; }
    .timeline-dot.resolve { background: #10b981; }
    .timeline-dot.dismiss { background: #64748b; }
    .timeline-dot.reopen { background: #f59e0b; }
    .timeline-dot.correct_value { background: #a855f7; }
    .timeline-meta { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; flex-wrap: wrap; }
    .timeline-user { font-weight: 700; color: #f1f5f9; }
    .timeline-action-badge { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; padding: 0.15rem 0.4rem; border-radius: 3px; background: #1e293b; color: #94a3b8; }
    .timeline-action-badge.resolve { background: var(--success-bg); color: #86efac; border: 1px solid var(--success-border); }
    .timeline-action-badge.dismiss { background: rgba(100, 116, 139, 0.2); color: #cbd5e1; }
    .timeline-action-badge.correct_value { background: var(--purple-bg); color: #d8b4fe; border: 1px solid var(--purple-border); }
    .timeline-time { color: #64748b; font-size: 0.75rem; margin-left: auto; }
    .timeline-exp { font-size: 0.85rem; color: #cbd5e1; line-height: 1.4; }
    .timeline-transition { display: flex; align-items: center; gap: 0.4rem; font-size: 0.75rem; color: #94a3b8; margin-top: 0.2rem; }
    .status-chip { background: #1e293b; padding: 0.1rem 0.35rem; border-radius: 3px; font-weight: 600; font-size: 0.7rem; }
    .status-chip.highlight { background: rgba(59, 130, 246, 0.2); color: #93c5fd; }
    .arrow { color: #64748b; }

    /* System Stats Bar */
    .system-stats-bar { display: flex; align-items: center; justify-content: space-around; gap: 1rem; padding: 1.25rem; flex-wrap: wrap; }
    .system-stat { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.25rem; }
    .stat-num { font-size: 1.6rem; font-weight: 800; color: #f8fafc; }
    .stat-text { font-size: 0.8rem; color: #94a3b8; }
    .stat-divider { width: 1px; height: 40px; background: #1f2937; }
    @media (max-width: 768px) {
      .stat-divider { display: none; }
      .main-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  private dashboardService = inject(DashboardService);

  stats: DashboardStatsResponse | null = null;
  isLoading = true;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.dashboardService.getStats().subscribe({
      next: data => {
        this.stats = data;
        this.isLoading = false;
      },
      error: err => {
        this.errorMessage = err?.error?.message || 'Failed to load dashboard metrics. Please ensure backend is running.';
        this.isLoading = false;
      }
    });
  }

  getRulePercentage(count: number): number {
    if (!this.stats || this.stats.findingMetrics.totalFindings === 0) return 0;
    return Math.min(100, Math.round((count / this.stats.findingMetrics.totalFindings) * 100));
  }
}
