import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { ClaimService } from '../../services/claim.service';
import { AuthService } from '../../core/auth/auth.service';
import { DashboardStatsResponse } from '../../models/dashboard.model';
import { Claim } from '../../models/claim.model';

interface DonutSegment {
  path: string;
  color: string;
  label: string;
  count: number;
  pct: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  template: `
<div class="dash-page">

  <!-- ╔══════════════════════════════════════════════════════════════════════
       PAGE HEADER
       ══════════════════════════════════════════════════════════════════════╗ -->
  <div class="dash-header">
    <div class="dash-title-block">
      <p class="dash-welcome">Welcome back, <strong>{{ authService.currentUser()?.name }}</strong> 👋</p>
      <h1 id="dashboard-title" class="dash-h1">Operations &amp; Fraud Risk Dashboard</h1>
      <p class="dash-subtitle">
        Monitor warranty claims, investigate suspicious activity, and review evidence-backed findings.
      </p>
    </div>
    <div class="dash-header-actions">
      <button id="btn-refresh-dashboard" class="btn btn-secondary btn-sm refresh-btn"
              (click)="refreshDashboard()"
              [class.spinning]="statsLoading || claimsLoading"
              title="Refresh dashboard data">
        <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" class="refresh-icon">
          <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
        </svg>
        {{ (statsLoading || claimsLoading) ? 'Loading...' : 'Refresh' }}
      </button>
      <a id="btn-view-claims" routerLink="/claims" class="btn btn-secondary btn-sm">
        View All Claims &rarr;
      </a>
      <a id="btn-executive-report" routerLink="/reports" class="btn btn-primary btn-sm">
        Executive Report
      </a>
    </div>
  </div>

  <!-- ╔══════════════════════════════════════════════════════════════════════
       STATS-LEVEL ERROR BANNER
       ══════════════════════════════════════════════════════════════════════╗ -->
  <div *ngIf="statsError && !statsLoading" class="alert-banner danger dash-section">
    <span>⚠ {{ statsError }}</span>
    <button class="btn btn-sm btn-secondary" (click)="loadStats()">Retry</button>
  </div>

  <!-- ╔══════════════════════════════════════════════════════════════════════
       KPI CARDS ROW
       ══════════════════════════════════════════════════════════════════════╗ -->
  <div class="kpi-row">

    <!-- Skeleton cards while loading -->
    <ng-container *ngIf="statsLoading">
      <div class="kpi-card" *ngFor="let _ of [1,2,3,4]">
        <div class="skeleton" style="height:14px;width:60%;margin-bottom:.75rem"></div>
        <div class="skeleton" style="height:32px;width:45%;margin-bottom:.5rem"></div>
        <div class="skeleton" style="height:12px;width:80%"></div>
      </div>
    </ng-container>

    <!-- Real KPI cards when loaded -->
    <ng-container *ngIf="!statsLoading && stats">

      <!-- Total Claims -->
      <div class="kpi-card" id="kpi-total-claims">
        <div class="kpi-top">
          <span class="kpi-label">Total Claims</span>
          <span class="kpi-icon kpi-icon-blue">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"/>
            </svg>
          </span>
        </div>
        <div class="kpi-value">{{ stats.claimMetrics.totalClaims }}</div>
        <div class="kpi-meta">
          <span class="kpi-sub-item">{{ stats.claimMetrics.submitted }} Submitted</span>
          <span class="kpi-dot">·</span>
          <span class="kpi-sub-item">{{ stats.claimMetrics.underReview }} Under Review</span>
        </div>
      </div>

      <!-- Flagged Claims -->
      <div class="kpi-card kpi-card-danger" id="kpi-flagged-claims">
        <div class="kpi-top">
          <span class="kpi-label">Flagged Claims</span>
          <span class="kpi-icon kpi-icon-red">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
          </span>
        </div>
        <div class="kpi-value kpi-value-red">{{ stats.claimMetrics.flagged }}</div>
        <div class="kpi-meta">
          <span class="kpi-anomaly-rate">{{ stats.claimMetrics.fraudRatePercentage }}% anomaly rate</span>
        </div>
      </div>

      <!-- Resolved Claims -->
      <div class="kpi-card kpi-card-success" id="kpi-resolved-claims">
        <div class="kpi-top">
          <span class="kpi-label">Resolved Claims</span>
          <span class="kpi-icon kpi-icon-green">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
          </span>
        </div>
        <div class="kpi-value kpi-value-green">{{ stats.claimMetrics.resolved }}</div>
        <div class="kpi-meta">
          <span class="kpi-sub-item">{{ stats.findingMetrics.resolved }} findings resolved</span>
        </div>
      </div>

      <!-- Pending Review -->
      <div class="kpi-card kpi-card-warning" id="kpi-pending-review">
        <div class="kpi-top">
          <span class="kpi-label">Pending Review</span>
          <span class="kpi-icon kpi-icon-amber">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
            </svg>
          </span>
        </div>
        <div class="kpi-value kpi-value-amber">{{ stats.findingMetrics.open + stats.findingMetrics.underInvestigation }}</div>
        <div class="kpi-meta">
          <span class="kpi-sub-item">
            {{ stats.findingMetrics.highSeverity }} high&nbsp;·&nbsp;{{ stats.findingMetrics.mediumSeverity }} medium
          </span>
        </div>
      </div>

    </ng-container>
  </div>

  <!-- ╔══════════════════════════════════════════════════════════════════════
       CHARTS ROW  (Claims by Status  |  Top Rules  |  Trend placeholder)
       ══════════════════════════════════════════════════════════════════════╗ -->
  <div class="charts-row" *ngIf="!statsLoading && stats">

    <!-- ── A: Claims by Status (Donut) ── -->
    <div class="chart-card" id="chart-claims-by-status">
      <div class="chart-card-header">
        <h2 class="chart-title">Claims by Status</h2>
      </div>

      <div class="donut-wrap" *ngIf="donutSegments.length > 0; else noDonut">
        <!-- SVG Donut -->
        <div class="donut-svg-wrap">
          <svg viewBox="0 0 180 180" width="160" height="160" aria-label="Claims by status donut chart">
            <g *ngFor="let seg of donutSegments">
              <path [attr.d]="seg.path" [attr.fill]="seg.color" opacity="0.92"/>
            </g>
            <!-- Center label -->
            <text x="90" y="86" text-anchor="middle" font-size="22" font-weight="700" fill="#0f172a">
              {{ stats.claimMetrics.totalClaims }}
            </text>
            <text x="90" y="102" text-anchor="middle" font-size="10" fill="#94a3b8" font-weight="500">
              Total Claims
            </text>
          </svg>
        </div>

        <!-- Legend -->
        <div class="donut-legend">
          <div class="legend-row" *ngFor="let seg of donutSegments">
            <span class="legend-dot" [style.background]="seg.color"></span>
            <span class="legend-label">{{ seg.label }}</span>
            <span class="legend-count">{{ seg.count }}</span>
            <span class="legend-pct">{{ seg.pct }}%</span>
          </div>
        </div>
      </div>

      <ng-template #noDonut>
        <div class="chart-empty">
          <span>No claim data available</span>
        </div>
      </ng-template>
    </div>

    <!-- ── B: Top Triggered Fraud Rules (Horizontal Bars) ── -->
    <div class="chart-card chart-card-wide" id="chart-top-rules">
      <div class="chart-card-header">
        <h2 class="chart-title">Top Reasons for Flagged Claims</h2>
        <span class="chart-badge">Rule Engine</span>
      </div>

      <div *ngIf="stats.topTriggeredRules.length > 0; else noRules" class="rules-list">
        <div class="rule-bar-row" *ngFor="let rule of stats.topTriggeredRules; let i = index"
             (click)="navigateToFindings(rule.ruleCode)" style="cursor:pointer" role="button"
             [attr.id]="'rule-bar-' + i">
          <div class="rule-bar-label-row">
            <span class="rule-bar-name">{{ rule.ruleName }}</span>
            <span class="rule-bar-count">{{ rule.count }}</span>
          </div>
          <div class="rule-bar-track">
            <div class="rule-bar-fill"
                 [style.width.%]="getBarPct(rule.count)"
                 [style.background]="getRuleColor(i)">
            </div>
          </div>
        </div>
      </div>

      <ng-template #noRules>
        <div class="chart-empty">No rule triggers recorded yet.</div>
      </ng-template>
    </div>

    <!-- ── C: System Metrics Bar ── -->
    <div class="chart-card chart-card-narrow" id="chart-system-metrics">
      <div class="chart-card-header">
        <h2 class="chart-title">System Catalog</h2>
      </div>
      <div class="sys-metrics">
        <div class="sys-metric-item">
          <span class="sys-metric-icon sys-icon-blue">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" clip-rule="evenodd"/>
            </svg>
          </span>
          <div class="sys-metric-info">
            <span class="sys-metric-value">{{ stats.systemMetrics.totalProducts }}</span>
            <span class="sys-metric-label">Registered Products</span>
          </div>
        </div>
        <div class="sys-metric-divider"></div>
        <div class="sys-metric-item">
          <span class="sys-metric-icon sys-icon-purple">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a3 3 0 016 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clip-rule="evenodd"/>
            </svg>
          </span>
          <div class="sys-metric-info">
            <span class="sys-metric-value">{{ stats.systemMetrics.totalEvidenceDocuments }}</span>
            <span class="sys-metric-label">Evidence Documents</span>
          </div>
        </div>
        <div class="sys-metric-divider"></div>
        <div class="sys-metric-item">
          <span class="sys-metric-icon sys-icon-amber">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
            </svg>
          </span>
          <div class="sys-metric-info">
            <span class="sys-metric-value">{{ stats.systemMetrics.manualOcrCorrections }}</span>
            <span class="sys-metric-label">OCR Corrections</span>
          </div>
        </div>
        <div class="sys-metric-divider"></div>
        <div class="sys-metric-item">
          <span class="sys-metric-icon sys-icon-red">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
          </span>
          <div class="sys-metric-info">
            <span class="sys-metric-value">{{ stats.findingMetrics.totalFindings }}</span>
            <span class="sys-metric-label">Total Findings</span>
          </div>
        </div>
      </div>
    </div>

  </div>

  <!-- ╔══════════════════════════════════════════════════════════════════════
       BOTTOM ROW: Recent Claims (wide) | Alerts + Investigations (narrow)
       ══════════════════════════════════════════════════════════════════════╗ -->
  <div class="bottom-row">

    <!-- ── Recent Claims Table ── -->
    <div class="panel recent-claims-panel" id="panel-recent-claims">
      <div class="panel-header">
        <h2 class="panel-title">Recent Claims</h2>
        <a routerLink="/claims" class="panel-link">View All</a>
      </div>

      <!-- Loading skeleton -->
      <div *ngIf="claimsLoading" class="claims-skeleton">
        <div class="skeleton-row" *ngFor="let _ of [1,2,3,4,5]">
          <div class="skeleton" style="height:14px;width:90%;border-radius:4px"></div>
        </div>
      </div>

      <!-- Error -->
      <div *ngIf="claimsError && !claimsLoading" class="chart-empty" style="color:var(--danger-text)">
        ⚠ {{ claimsError }}
        <button class="btn btn-xs btn-secondary" style="margin-top:.5rem" (click)="loadRecentClaims()">Retry</button>
      </div>

      <!-- Claims Table -->
      <div class="table-wrap" *ngIf="!claimsLoading && recentClaims.length > 0">
        <table class="data-table claims-table" aria-label="Recent claims">
          <thead>
            <tr>
              <th>Claim ID</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Serial No.</th>
              <th>Status</th>
              <th>Findings</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of recentClaims" [id]="'claim-row-' + c.claimId">
              <td>
                <span class="mono-id">{{ c.claimNumber }}</span>
              </td>
              <td>
                <span class="td-main">{{ c.claimantName || '—' }}</span>
              </td>
              <td>
                <span class="td-main">{{ c.productModel || '—' }}</span>
              </td>
              <td>
                <code class="serial-code">{{ c.productSerialNumber || '—' }}</code>
              </td>
              <td>
                <span class="pill" [ngClass]="getStatusPillClass(c.status)">
                  {{ formatStatus(c.status) }}
                </span>
              </td>
              <td>
                <span *ngIf="c.openFindingsCount && c.openFindingsCount > 0"
                      class="pill pill-flagged" style="font-size:.7rem">
                  {{ c.openFindingsCount }} open
                </span>
                <span *ngIf="!c.openFindingsCount || c.openFindingsCount === 0"
                      class="td-dim">—</span>
              </td>
              <td>
                <span class="td-dim">{{ c.claimDate | date:'MMM d, y' }}</span>
              </td>
              <td>
                <a [routerLink]="['/claims']"
                   [queryParams]="{search: c.claimNumber}"
                   class="btn btn-xs btn-ghost"
                   [attr.id]="'view-claim-' + c.claimId"
                   title="View claim {{ c.claimNumber }}">
                  View
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty state -->
      <div *ngIf="!claimsLoading && !claimsError && recentClaims.length === 0" class="chart-empty">
        No claims submitted yet.
      </div>
    </div>

    <!-- ── Right column ── -->
    <div class="right-col" *ngIf="!statsLoading && stats">

      <!-- System Alerts (from investigation activities) -->
      <div class="panel alerts-panel" id="panel-system-alerts">
        <div class="panel-header">
          <h2 class="panel-title">System Alerts</h2>
          <a routerLink="/findings" class="panel-link">View All</a>
        </div>

        <div *ngIf="stats.recentActivities.length === 0" class="chart-empty" style="padding:1.5rem 0">
          No recent alerts.
        </div>

        <div class="alerts-list">
          <div class="alert-item" *ngFor="let act of stats.recentActivities | slice:0:4"
               (click)="navigateToInvestigations()" style="cursor:pointer">
            <span class="alert-dot" [ngClass]="getActionDotClass(act.actionType)">
              <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor">
                <circle cx="10" cy="10" r="10"/>
              </svg>
            </span>
            <div class="alert-body">
              <p class="alert-text">
                <strong>{{ act.userName || 'System' }}</strong>
                {{ formatActionVerb(act.actionType) }} finding #{{ act.findingId }}
              </p>
              <p class="alert-time">{{ act.actionTime | date:'MMM d · h:mm a' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Investigations -->
      <div class="panel investigations-panel" id="panel-recent-investigations">
        <div class="panel-header">
          <h2 class="panel-title">Recent Investigations</h2>
          <a routerLink="/investigations" class="panel-link">View All</a>
        </div>

        <div *ngIf="stats.recentActivities.length === 0" class="chart-empty" style="padding:1.5rem 0">
          No investigation actions recorded.
        </div>

        <div class="inv-list">
          <div class="inv-item" *ngFor="let act of stats.recentActivities | slice:0:5"
               (click)="navigateToInvestigations()" style="cursor:pointer">
            <div class="inv-icon-wrap">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" [style.color]="getActionColor(act.actionType)">
                <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clip-rule="evenodd"/>
                <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clip-rule="evenodd"/>
              </svg>
            </div>
            <div class="inv-body">
              <p class="inv-id">Finding #{{ act.findingId }}</p>
              <p class="inv-action">
                <span class="inv-action-badge" [ngClass]="getActionBadgeClass(act.actionType)">
                  {{ formatActionType(act.actionType) }}
                </span>
                <span class="inv-time">{{ act.actionTime | date:'MMM d, h:mm a' }}</span>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>

  </div>

</div>
  `,
  styles: [`
    /* ══ Page ══ */
    .dash-page {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      min-height: 100%;
    }

    /* ══ Header ══ */
    .dash-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .dash-welcome {
      font-size: .8125rem;
      color: var(--text-muted);
      margin-bottom: .25rem;
    }
    .dash-h1 {
      font-size: 1.375rem;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: .25rem;
    }
    .dash-subtitle {
      font-size: .8125rem;
      color: var(--text-muted);
      max-width: 520px;
    }
    .dash-header-actions {
      display: flex;
      gap: .5rem;
      flex-wrap: wrap;
    }
    .dash-section { /* margin top override */ }

    /* ══ KPI Row ══ */
    .kpi-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: .875rem;
    }
    @media (max-width: 1200px) { .kpi-row { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 640px)  { .kpi-row { grid-template-columns: 1fr; } }

    .kpi-card {
      background: #fff;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 1.125rem 1.25rem;
      box-shadow: var(--shadow-xs);
      display: flex;
      flex-direction: column;
      gap: .5rem;
      transition: box-shadow .2s, border-color .2s;
    }
    .kpi-card:hover { box-shadow: var(--shadow-sm); }

    .kpi-card-danger  { border-left: 3px solid var(--danger); }
    .kpi-card-success { border-left: 3px solid var(--success); }
    .kpi-card-warning { border-left: 3px solid var(--warning); }

    .kpi-top { display: flex; justify-content: space-between; align-items: center; }
    .kpi-label { font-size: .75rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: .04em; }

    .kpi-icon {
      width: 32px; height: 32px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .kpi-icon-blue   { background: #eff6ff; color: var(--primary); }
    .kpi-icon-red    { background: var(--danger-bg);  color: var(--danger); }
    .kpi-icon-green  { background: var(--success-bg); color: var(--success); }
    .kpi-icon-amber  { background: var(--warning-bg); color: var(--warning); }

    .kpi-value       { font-size: 2rem; font-weight: 800; color: var(--text-main); line-height: 1.1; }
    .kpi-value-red   { color: var(--danger); }
    .kpi-value-green { color: var(--success); }
    .kpi-value-amber { color: var(--warning); }

    .kpi-meta { display: flex; align-items: center; gap: .35rem; flex-wrap: wrap; }
    .kpi-sub-item { font-size: .75rem; color: var(--text-muted); }
    .kpi-dot { color: var(--text-dim); }
    .kpi-anomaly-rate {
      font-size: .7rem; font-weight: 600;
      background: var(--danger-bg); color: var(--danger-text);
      border: 1px solid var(--danger-border);
      padding: .1rem .45rem; border-radius: 999px;
    }

    /* ══ Charts Row ══ */
    .charts-row {
      display: grid;
      grid-template-columns: 220px 1fr 200px;
      gap: .875rem;
      align-items: start;
    }
    @media (max-width: 1200px) {
      .charts-row { grid-template-columns: 1fr 1fr; }
      .chart-card-narrow { grid-column: 1 / -1; }
    }
    @media (max-width: 768px)  { .charts-row { grid-template-columns: 1fr; } }

    .chart-card {
      background: #fff;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 1.125rem 1.25rem;
      box-shadow: var(--shadow-xs);
    }
    .chart-card-wide   { /* takes fr space */ }
    .chart-card-narrow { /* system metrics */ }

    .chart-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .chart-title { font-size: .875rem; font-weight: 600; color: var(--text-main); }
    .chart-badge {
      font-size: .65rem; font-weight: 700; text-transform: uppercase; letter-spacing: .04em;
      background: var(--bg-elevated); color: var(--text-muted);
      padding: .15rem .45rem; border-radius: 4px; border: 1px solid var(--border-subtle);
    }
    .chart-empty { color: var(--text-dim); font-size: .8125rem; text-align: center; padding: 2rem 0; display: flex; flex-direction: column; align-items: center; gap: .5rem; }

    /* ── Donut Chart ── */
    .donut-wrap { display: flex; align-items: center; gap: 1.25rem; }
    .donut-svg-wrap { flex-shrink: 0; }

    .donut-legend { display: flex; flex-direction: column; gap: .5rem; flex: 1; }
    .legend-row { display: flex; align-items: center; gap: .5rem; font-size: .8rem; }
    .legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .legend-label { flex: 1; color: var(--text-muted); }
    .legend-count { font-weight: 600; color: var(--text-main); }
    .legend-pct { color: var(--text-dim); min-width: 32px; text-align: right; }

    /* ── Rule Bars ── */
    .rules-list { display: flex; flex-direction: column; gap: .875rem; }
    .rule-bar-row { display: flex; flex-direction: column; gap: .375rem; }
    .rule-bar-label-row { display: flex; justify-content: space-between; align-items: baseline; }
    .rule-bar-name { font-size: .8125rem; color: var(--text-main); font-weight: 500; }
    .rule-bar-count {
      font-size: .75rem; font-weight: 700;
      background: var(--bg-elevated); color: var(--text-muted);
      padding: .1rem .4rem; border-radius: 4px;
    }
    .rule-bar-track {
      height: 8px; background: var(--bg-elevated);
      border-radius: 999px; overflow: hidden;
    }
    .rule-bar-fill { height: 100%; border-radius: 999px; transition: width .5s ease; }

    /* ── System Metrics ── */
    .sys-metrics { display: flex; flex-direction: column; }
    .sys-metric-item { display: flex; align-items: center; gap: .75rem; padding: .625rem 0; }
    .sys-metric-icon {
      width: 32px; height: 32px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .sys-icon-blue   { background: #eff6ff; color: var(--primary); }
    .sys-icon-purple { background: var(--purple-bg); color: var(--purple); }
    .sys-icon-amber  { background: var(--warning-bg); color: var(--warning); }
    .sys-icon-red    { background: var(--danger-bg);  color: var(--danger); }
    .sys-metric-info { display: flex; flex-direction: column; }
    .sys-metric-value { font-size: 1.125rem; font-weight: 700; color: var(--text-main); line-height: 1.2; }
    .sys-metric-label { font-size: .75rem; color: var(--text-muted); }
    .sys-metric-divider { height: 1px; background: var(--border-subtle); }

    /* ══ Bottom Row ══ */
    .bottom-row {
      display: grid;
      grid-template-columns: 1fr 300px;
      gap: .875rem;
      align-items: start;
    }
    @media (max-width: 1100px) { .bottom-row { grid-template-columns: 1fr; } }

    .panel {
      background: #fff;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xs);
      overflow: hidden;
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--border-subtle);
    }
    .panel-title { font-size: .875rem; font-weight: 600; color: var(--text-main); }
    .panel-link  { font-size: .8rem; color: var(--primary); font-weight: 500; }
    .panel-link:hover { text-decoration: underline; }

    /* ── Claims Table ── */
    .table-wrap { overflow-x: auto; }
    .claims-table td { font-size: .8125rem; }
    .mono-id   { font-family: 'JetBrains Mono', monospace; font-size: .775rem; color: var(--text-muted); }
    .serial-code { font-family: 'JetBrains Mono', monospace; font-size: .75rem; color: var(--text-muted); background: var(--bg-elevated); padding: .1rem .35rem; border-radius: 3px; }
    .td-main { font-weight: 500; color: var(--text-main); }
    .td-dim  { color: var(--text-dim); font-size: .75rem; }

    /* Skeleton for claims table */
    .claims-skeleton { display: flex; flex-direction: column; gap: .75rem; padding: 1.25rem; }
    .skeleton-row { display: flex; }

    /* ── Right Column ── */
    .right-col { display: flex; flex-direction: column; gap: .875rem; }

    /* ── Alerts Panel ── */
    .alerts-list { display: flex; flex-direction: column; }
    .alert-item {
      display: flex; align-items: flex-start; gap: .75rem;
      padding: .75rem 1.25rem;
      border-bottom: 1px solid var(--border-subtle);
      transition: background .15s;
    }
    .alert-item:last-child { border-bottom: none; }
    .alert-item:hover { background: var(--bg-elevated); }
    .alert-dot {
      width: 20px; height: 20px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; margin-top: .1rem;
    }
    .alert-dot.resolve, .alert-dot.status_change   { background: #dcfce7; color: var(--success); }
    .alert-dot.dismiss                              { background: #f1f5f9; color: var(--text-dim); }
    .alert-dot.reopen, .alert-dot.correct_value    { background: var(--warning-bg); color: var(--warning); }
    .alert-dot.comment, .alert-dot.request_evidence { background: var(--info-bg); color: var(--info); }
    .alert-body { flex: 1; min-width: 0; }
    .alert-text { font-size: .8rem; color: var(--text-main); line-height: 1.4; }
    .alert-time { font-size: .7rem; color: var(--text-dim); margin-top: .2rem; }

    /* ── Investigations Panel ── */
    .inv-list { display: flex; flex-direction: column; }
    .inv-item {
      display: flex; align-items: flex-start; gap: .75rem;
      padding: .75rem 1.25rem;
      border-bottom: 1px solid var(--border-subtle);
      transition: background .15s;
    }
    .inv-item:last-child { border-bottom: none; }
    .inv-item:hover { background: var(--bg-elevated); }
    .inv-icon-wrap {
      width: 28px; height: 28px;
      background: var(--bg-elevated);
      border-radius: 7px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .inv-body { flex: 1; min-width: 0; }
    .inv-id { font-size: .8rem; font-weight: 600; color: var(--text-main); }
    .inv-action { display: flex; align-items: center; gap: .5rem; margin-top: .2rem; }
    .inv-action-badge {
      font-size: .65rem; font-weight: 700; text-transform: uppercase;
      padding: .1rem .35rem; border-radius: 3px; letter-spacing: .02em;
    }
    .inv-action-badge.resolve   { background: #dcfce7; color: var(--success-text); }
    .inv-action-badge.dismiss   { background: #f1f5f9; color: var(--text-muted); }
    .inv-action-badge.reopen    { background: var(--warning-bg); color: var(--warning-text); }
    .inv-action-badge.comment   { background: var(--info-bg); color: var(--info-text); }
    .inv-action-badge.correct_value { background: var(--purple-bg); color: var(--purple-text); }
    .inv-action-badge.status_change { background: #eff6ff; color: var(--primary); }
    .inv-action-badge.request_evidence { background: var(--info-bg); color: var(--info-text); }
    .inv-time { font-size: .7rem; color: var(--text-dim); margin-left: auto; white-space: nowrap; }
  `]
})
export class DashboardComponent implements OnInit {
  authService    = inject(AuthService);
  private dashSvc  = inject(DashboardService);
  private claimSvc = inject(ClaimService);
  private router   = inject(Router);

  // ── State ──
  stats:        DashboardStatsResponse | null = null;
  recentClaims: Claim[] = [];

  statsLoading  = true;
  claimsLoading = true;
  statsError:   string | null = null;
  claimsError:  string | null = null;

  // ── Derived ──
  donutSegments: DonutSegment[] = [];
  barMax = 1;

  private readonly barColors = ['#3b82f6','#ef4444','#f59e0b','#8b5cf6','#10b981','#6366f1'];
  private readonly donutColors: Record<string, string> = {
    SUBMITTED:    '#3b82f6',
    UNDER_REVIEW: '#f59e0b',
    FLAGGED:      '#ef4444',
    RESOLVED:     '#10b981',
  };

  ngOnInit(): void {
    this.loadStats();
    this.loadRecentClaims();
  }

  refreshDashboard(): void {
    this.loadStats();
    this.loadRecentClaims();
  }

  // ─────────────────────────────────────────────────────────
  // DATA LOADING  (independent: one failure doesn't block the other)
  // ─────────────────────────────────────────────────────────
  loadStats(): void {
    this.statsLoading = true;
    this.statsError   = null;
    this.dashSvc.getStats().subscribe({
      next: data => {
        this.stats        = data;
        this.statsLoading = false;
        this.computeDonut();
        this.barMax = data.topTriggeredRules.length
          ? Math.max(...data.topTriggeredRules.map(r => r.count))
          : 1;
      },
      error: err => {
        this.statsError   = err?.error?.message ?? 'Failed to load dashboard metrics. Is the backend running?';
        this.statsLoading = false;
      }
    });
  }

  loadRecentClaims(): void {
    this.claimsLoading = true;
    this.claimsError   = null;
    this.claimSvc.getClaims({ page: 0, size: 5, sortBy: 'claimId', direction: 'DESC' }).subscribe({
      next: data => {
        this.recentClaims = data.content;
        this.claimsLoading = false;
      },
      error: () => {
        this.claimsError   = 'Failed to load recent claims.';
        this.claimsLoading = false;
      }
    });
  }

  // ─────────────────────────────────────────────────────────
  // SVG DONUT CHART
  // ─────────────────────────────────────────────────────────
  private computeDonut(): void {
    if (!this.stats) return;
    const m = this.stats.claimMetrics;
    const total = m.totalClaims;
    if (total === 0) return;

    const slices = [
      { label: 'Submitted',    count: m.submitted,    status: 'SUBMITTED' },
      { label: 'Under Review', count: m.underReview,  status: 'UNDER_REVIEW' },
      { label: 'Flagged',      count: m.flagged,      status: 'FLAGGED' },
      { label: 'Resolved',     count: m.resolved,     status: 'RESOLVED' },
    ].filter(s => s.count > 0);

    const cx = 90, cy = 90, r = 72, ir = 46;
    const rad = (a: number) => a * Math.PI / 180;
    let startAngle = -90;
    const GAP_DEG = slices.length > 1 ? 2 : 0;

    this.donutSegments = slices.map(s => {
      const pct   = s.count / total;
      const sweep = pct * 360 - GAP_DEG;
      const end   = startAngle + sweep;
      const large = sweep > 180 ? 1 : 0;

      const x1  = cx + r  * Math.cos(rad(startAngle));
      const y1  = cy + r  * Math.sin(rad(startAngle));
      const x2  = cx + r  * Math.cos(rad(end));
      const y2  = cy + r  * Math.sin(rad(end));
      const ix1 = cx + ir * Math.cos(rad(end));
      const iy1 = cy + ir * Math.sin(rad(end));
      const ix2 = cx + ir * Math.cos(rad(startAngle));
      const iy2 = cy + ir * Math.sin(rad(startAngle));

      const path = `M ${x1.toFixed(2)} ${y1.toFixed(2)} ` +
                   `A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} ` +
                   `L ${ix1.toFixed(2)} ${iy1.toFixed(2)} ` +
                   `A ${ir} ${ir} 0 ${large} 0 ${ix2.toFixed(2)} ${iy2.toFixed(2)} Z`;

      startAngle += pct * 360; // advance by full sweep (gap is visual only via clip)
      return {
        path,
        color: this.donutColors[s.status] ?? '#94a3b8',
        label: s.label,
        count: s.count,
        pct:   Math.round(pct * 100)
      };
    });
  }

  // ─────────────────────────────────────────────────────────
  // UTILITIES
  // ─────────────────────────────────────────────────────────
  getBarPct(count: number): number {
    return this.barMax > 0 ? Math.round((count / this.barMax) * 100) : 0;
  }

  getRuleColor(idx: number): string {
    return this.barColors[idx % this.barColors.length];
  }

  getStatusPillClass(status: string): string {
    return 'pill-' + (status ?? '').toLowerCase().replace('_', '-');
  }

  formatStatus(status: string): string {
    return (status ?? '').replace('_', ' ');
  }

  getActionDotClass(actionType: string): string {
    return (actionType ?? '').toLowerCase();
  }

  getActionColor(actionType: string): string {
    const map: Record<string, string> = {
      RESOLVE:          '#16a34a',
      DISMISS:          '#94a3b8',
      REOPEN:           '#d97706',
      CORRECT_VALUE:    '#7c3aed',
      STATUS_CHANGE:    '#0284c7',
      COMMENT:          '#0284c7',
      REQUEST_EVIDENCE: '#0284c7',
    };
    return map[actionType] ?? '#94a3b8';
  }

  getActionBadgeClass(actionType: string): string {
    return (actionType ?? '').toLowerCase().replace('_', '_');
  }

  formatActionType(actionType: string): string {
    return (actionType ?? '').replace('_', ' ').toLowerCase();
  }

  formatActionVerb(actionType: string): string {
    const map: Record<string, string> = {
      RESOLVE:          'resolved',
      DISMISS:          'dismissed',
      REOPEN:           'reopened',
      CORRECT_VALUE:    'corrected value on',
      STATUS_CHANGE:    'changed status of',
      COMMENT:          'commented on',
      REQUEST_EVIDENCE: 'requested evidence for',
    };
    return map[actionType] ?? 'updated';
  }

  navigateToFindings(ruleCode: string): void {
    this.router.navigate(['/findings']);
  }

  navigateToInvestigations(): void {
    this.router.navigate(['/investigations']);
  }
}
