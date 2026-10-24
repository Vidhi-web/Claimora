import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FindingService } from '../../services/finding.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../core/auth/auth.service';
import { Finding, FindingSeverity, FindingStatus, EvidenceLink } from '../../models/finding.model';
import { InvestigationAction, ActionType, InvestigationActionRequest } from '../../models/investigation.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-findings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <!-- Page Header -->
      <header class="page-header">
        <div>
          <div class="badge-tag">Rule Engine Discrepancies</div>
          <h1>Investigation Findings & Evidence Graph</h1>
          <p class="subtitle">Discovered warranty fraud risks, cross-claim evidence links, and investigator assignments.</p>
        </div>
      </header>

      <!-- Toolbar -->
      <div class="claimora-card toolbar-card">
        <div class="filter-row">
          <div class="filter-tabs">
            <span class="filter-label">Status:</span>
            <button class="tab-btn" [class.active]="selectedStatus === undefined" (click)="setStatusFilter(undefined)">All</button>
            <button class="tab-btn" [class.active]="selectedStatus === 'OPEN'" (click)="setStatusFilter('OPEN')">Open</button>
            <button class="tab-btn" [class.active]="selectedStatus === 'UNDER_INVESTIGATION'" (click)="setStatusFilter('UNDER_INVESTIGATION')">Under Investigation</button>
            <button class="tab-btn" [class.active]="selectedStatus === 'RESOLVED'" (click)="setStatusFilter('RESOLVED')">Resolved</button>
            <button class="tab-btn" [class.active]="selectedStatus === 'DISMISSED'" (click)="setStatusFilter('DISMISSED')">Dismissed</button>
          </div>

          <div class="filter-tabs">
            <span class="filter-label">Severity:</span>
            <button class="tab-btn" [class.active]="selectedSeverity === undefined" (click)="setSeverityFilter(undefined)">All</button>
            <button class="tab-btn sev-high" [class.active]="selectedSeverity === 'HIGH'" (click)="setSeverityFilter('HIGH')">High</button>
            <button class="tab-btn sev-med" [class.active]="selectedSeverity === 'MEDIUM'" (click)="setSeverityFilter('MEDIUM')">Medium</button>
            <button class="tab-btn sev-low" [class.active]="selectedSeverity === 'LOW'" (click)="setSeverityFilter('LOW')">Low</button>
          </div>
        </div>
      </div>

      <!-- Alert Banner -->
      <div *ngIf="alertMessage" class="alert-banner" [ngClass]="alertType">
        <span>{{ alertMessage }}</span>
        <button (click)="alertMessage = null" class="close-alert">&times;</button>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <span>Loading investigation findings...</span>
      </div>

      <!-- Findings Cards List -->
      <div *ngIf="!loading" class="findings-grid">
        <div *ngFor="let f of findings" class="claimora-card finding-card" [ngClass]="'border-' + f.severity.toLowerCase()">
          <div class="card-top">
            <div class="finding-id-section">
              <span class="finding-id">#{{ f.findingId }}</span>
              <span class="rule-chip">{{ f.ruleCode }}</span>
            </div>
            <div class="status-tags">
              <span class="pill" [ngClass]="'pill-' + f.severity.toLowerCase()">{{ f.severity }}</span>
              <span class="pill" [ngClass]="'pill-' + f.status.toLowerCase().replace('_', '-')">{{ f.status }}</span>
            </div>
          </div>

          <div class="claim-context">
            <span class="context-claim">Claim {{ f.claimNumber || 'ID #' + f.claimId }}</span>
            <span class="context-product" *ngIf="f.productModel">&bull; {{ f.productModel }}</span>
            <code class="serial-mini" *ngIf="f.productSerialNumber">({{ f.productSerialNumber }})</code>
          </div>

          <p class="finding-description">{{ f.description }}</p>

          <!-- Evidence Links Preview Strip -->
          <div class="evidence-strip" *ngIf="f.linkedDocuments && f.linkedDocuments.length > 0">
            <span class="strip-heading">Evidence Graph ({{ f.linkedDocuments.length }} documents):</span>
            <div class="evidence-pill-row">
              <span *ngFor="let link of f.linkedDocuments" class="role-badge" [ngClass]="link.evidenceRole.toLowerCase().replace('_', '-')">
                Doc #{{ link.documentId }} &bull; {{ link.evidenceRole }}
              </span>
            </div>
          </div>

          <!-- Assignee & Action Footer -->
          <div class="card-footer">
            <div class="assignee-box">
              <span class="assignee-label">Assigned:</span>
              <span class="assignee-name" *ngIf="f.assignedTo">{{ f.assignedTo.name }}</span>
              <span class="unassigned-text" *ngIf="!f.assignedTo">Unassigned</span>
              <button
                class="btn-text-action"
                *ngIf="isAdmin"
                (click)="openAssignModal(f)"
                title="Change investigator"
              >
                ✎ Assign
              </button>
            </div>

            <div class="card-actions">
              <button class="btn btn-secondary btn-sm" (click)="openEvidenceGraphModal(f)">
                🔍 Evidence Graph
              </button>
              <button class="btn btn-primary btn-sm" (click)="openActionModal(f)" *ngIf="canTakeAction">
                ⚡ Action & Transition
              </button>
            </div>
          </div>
        </div>

        <div *ngIf="findings.length === 0" class="empty-findings claimora-card">
          <div class="empty-icon">🛡️</div>
          <h3>No Findings Match Filter</h3>
          <p>No fraud risk findings found for the selected status and severity.</p>
        </div>
      </div>

      <!-- VISUAL EVIDENCE GRAPH MODAL -->
      <div class="modal-overlay" *ngIf="graphFinding">
        <div class="modal-dialog graph-dialog">
          <div class="modal-header">
            <div>
              <h3>Visual Evidence Graph & Forensic Discrepancy</h3>
              <span class="subhead">Finding #{{ graphFinding.findingId }} &bull; Rule: {{ graphFinding.ruleCode }}</span>
            </div>
            <button class="modal-close" (click)="graphFinding = null">&times;</button>
          </div>
          <div class="modal-body">
            <!-- Diagram Container -->
            <div class="graph-canvas">
              <!-- Central Finding Node -->
              <div class="graph-node central-node" [ngClass]="'node-' + graphFinding.severity.toLowerCase()">
                <div class="node-tag">FINDING #{{ graphFinding.findingId }}</div>
                <div class="node-title">{{ graphFinding.ruleCode }}</div>
                <div class="node-meta">
                  <span>{{ graphFinding.severity }} SEVERITY</span> &bull; <span>{{ graphFinding.status }}</span>
                </div>
                <div class="node-claim">Claim: {{ graphFinding.claimNumber || '#' + graphFinding.claimId }}</div>
              </div>

              <!-- Connector Lines & Connected Documents -->
              <div class="connected-nodes-wrap" *ngIf="graphFinding.linkedDocuments && graphFinding.linkedDocuments.length > 0; else noLinks">
                <div *ngFor="let link of graphFinding.linkedDocuments" class="graph-link-branch">
                  <div class="link-connector">
                    <span class="connector-line"></span>
                    <span class="connector-label" [ngClass]="link.evidenceRole.toLowerCase().replace('_', '-')">
                      {{ link.evidenceRole }}
                    </span>
                    <span class="connector-line"></span>
                  </div>

                  <div class="graph-node doc-node">
                    <div class="doc-header">
                      <span class="doc-type-tag">{{ link.documentType || 'DOCUMENT' }}</span>
                      <span class="doc-id">Doc #{{ link.documentId }}</span>
                    </div>
                    <div class="doc-filename">{{ link.originalFilename || 'evidence_file' }}</div>
                    <code class="doc-hash" *ngIf="link.fileHash">{{ link.fileHash | slice:0:20 }}...</code>
                  </div>
                </div>
              </div>

              <ng-template #noLinks>
                <div class="no-evidence-box">
                  <span>No explicit cross-claim documents linked to this finding node.</span>
                </div>
              </ng-template>
            </div>

            <!-- Finding Explanation & Audit Log -->
            <div class="finding-details-box">
              <h4>Discrepancy Details</h4>
              <p>{{ graphFinding.description }}</p>
            </div>

            <!-- Investigation Action Audit Trail for this Finding -->
            <div class="audit-history-box">
              <h4>Append-Only Action History ({{ findingActions.length }} Actions)</h4>
              <div class="timeline" *ngIf="findingActions.length > 0; else noTimeline">
                <div *ngFor="let act of findingActions" class="timeline-entry">
                  <div class="timeline-dot"></div>
                  <div class="timeline-content">
                    <div class="timeline-header">
                      <span class="act-type">{{ act.actionType }}</span>
                      <span class="act-user">by {{ act.userName || 'Investigator' }}</span>
                      <span class="act-time">{{ act.actionTime | date:'short' }}</span>
                    </div>
                    <p class="act-exp">"{{ act.explanation }}"</p>
                    <div class="act-transition" *ngIf="act.previousStatus !== act.newStatus">
                      Status transitioned: <code>{{ act.previousStatus }}</code> &rarr; <code>{{ act.newStatus }}</code>
                    </div>
                  </div>
                </div>
              </div>
              <ng-template #noTimeline>
                <div class="empty-timeline">No actions recorded for this finding yet.</div>
              </ng-template>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="graphFinding = null">Close</button>
          </div>
        </div>
      </div>

      <!-- ASSIGN FINDING MODAL (Admin Only) -->
      <div class="modal-overlay" *ngIf="assigningFinding">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3>Assign Finding to Investigator</h3>
            <button class="modal-close" (click)="assigningFinding = null">&times;</button>
          </div>
          <div class="modal-body">
            <p>Assign Finding #{{ assigningFinding.findingId }} ({{ assigningFinding.ruleCode }}) to an active team member:</p>

            <div class="form-group">
              <label>Select Investigator *</label>
              <select class="form-control" [(ngModel)]="selectedUserId">
                <option [ngValue]="0" disabled>Select investigator...</option>
                <option *ngFor="let u of investigators" [ngValue]="u.userId">
                  {{ u.name }} ({{ u.email }}) &bull; [{{ u.role }}]
                </option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="assigningFinding = null">Cancel</button>
            <button class="btn btn-primary" [disabled]="submittingAssign || !selectedUserId" (click)="submitAssign()">
              <span *ngIf="submittingAssign" class="spinner"></span>
              <span>Confirm Assignment</span>
            </button>
          </div>
        </div>
      </div>

      <!-- RECORD ACTION & STATE TRANSITION MODAL -->
      <div class="modal-overlay" *ngIf="actingFinding">
        <div class="modal-dialog">
          <div class="modal-header">
            <div>
              <h3>Record Action & Transition Status</h3>
              <span class="subhead">Finding #{{ actingFinding.findingId }} &bull; Current: {{ actingFinding.status }}</span>
            </div>
            <button class="modal-close" (click)="actingFinding = null">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Action Type *</label>
              <select class="form-control" [(ngModel)]="actionRequest.actionType" (change)="onActionTypeChange()">
                <option value="COMMENT">COMMENT (Add investigation notes)</option>
                <option value="REQUEST_EVIDENCE">REQUEST_EVIDENCE (Request additional documentation)</option>
                <option value="STATUS_CHANGE">STATUS_CHANGE (Transition investigation phase)</option>
                <option value="RESOLVE">RESOLVE (Close finding with confirmed resolution)</option>
                <option value="DISMISS">DISMISS (Dismiss finding as false positive / acceptable)</option>
                <option value="REOPEN">REOPEN (Reopen a previously resolved/dismissed finding)</option>
              </select>
            </div>

            <div class="form-group" *ngIf="actionRequest.actionType === 'STATUS_CHANGE'">
              <label>Target Status *</label>
              <select class="form-control" [(ngModel)]="actionRequest.newStatus">
                <option value="OPEN">OPEN</option>
                <option value="UNDER_INVESTIGATION">UNDER_INVESTIGATION</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="DISMISSED">DISMISSED</option>
              </select>
            </div>

            <div class="form-group">
              <label>Mandatory Explanation / Justification *</label>
              <textarea
                class="form-control"
                rows="4"
                [(ngModel)]="actionRequest.explanation"
                placeholder="Detail forensic verification steps, claimant interviews, or rationale (required by audit policy)..."
              ></textarea>
              <span class="field-hint">Every action is permanently recorded in the append-only audit trail and cannot be edited or deleted.</span>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="actingFinding = null">Cancel</button>
            <button
              class="btn btn-primary"
              [disabled]="submittingAction || !actionRequest.explanation"
              (click)="submitAction()"
            >
              <span *ngIf="submittingAction" class="spinner"></span>
              <span>Commit Action</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .badge-tag {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 700;
      color: #f59e0b;
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.3);
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

    .toolbar-card {
      padding: 1rem 1.5rem;
    }

    .filter-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .filter-tabs {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      background: var(--bg-surface);
      padding: 0.25rem 0.5rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-subtle);
    }

    .filter-label {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--text-dim);
      margin-right: 0.35rem;
      text-transform: uppercase;
    }

    .tab-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      padding: 0.35rem 0.7rem;
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

    .tab-btn.sev-high.active {
      background: #ef4444;
    }

    .tab-btn.sev-med.active {
      background: #f59e0b;
    }

    .tab-btn.sev-low.active {
      background: #10b981;
    }

    .findings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
      gap: 1.5rem;
    }

    .finding-card {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      border-left-width: 4px;
    }

    .finding-card.border-high {
      border-left-color: #ef4444;
    }

    .finding-card.border-medium {
      border-left-color: #f59e0b;
    }

    .finding-card.border-low {
      border-left-color: #10b981;
    }

    .card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .finding-id-section {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .finding-id {
      font-size: 0.8rem;
      color: var(--text-dim);
      font-weight: 700;
    }

    .rule-chip {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
      font-weight: 700;
      color: #a855f7;
      background: rgba(168, 85, 247, 0.15);
      border: 1px solid rgba(168, 85, 247, 0.3);
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
    }

    .status-tags {
      display: flex;
      gap: 0.4rem;
    }

    .claim-context {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.85rem;
    }

    .context-claim {
      font-weight: 600;
      color: #60a5fa;
    }

    .context-product {
      color: var(--text-muted);
    }

    .serial-mini {
      font-size: 0.75rem;
      color: var(--text-dim);
    }

    .finding-description {
      margin: 0;
      font-size: 0.875rem;
      color: var(--text-main);
      line-height: 1.5;
      flex: 1;
    }

    .evidence-strip {
      background: var(--bg-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 0.65rem 0.85rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .strip-heading {
      font-size: 0.75rem;
      color: var(--text-dim);
      text-transform: uppercase;
      font-weight: 600;
    }

    .evidence-pill-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
    }

    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--border-subtle);
      padding-top: 0.85rem;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .assignee-box {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.825rem;
    }

    .assignee-label {
      color: var(--text-dim);
    }

    .assignee-name {
      color: var(--text-main);
      font-weight: 600;
    }

    .unassigned-text {
      color: var(--text-dim);
      font-style: italic;
    }

    .btn-text-action {
      background: transparent;
      border: none;
      color: #2563eb;
      font-size: 0.75rem;
      cursor: pointer;
      text-decoration: underline;
    }

    .card-actions {
      display: flex;
      gap: 0.4rem;
    }

    .empty-findings {
      grid-column: 1 / -1;
      padding: 4rem 2rem;
      text-align: center;
      color: var(--text-muted);
    }

    .empty-icon {
      font-size: 3rem;
    }

    /* Graph Dialog & Canvas */
    .graph-dialog {
      max-width: 900px;
    }

    .subhead {
      font-size: 0.8rem;
      color: var(--text-dim);
    }

    .graph-canvas {
      background: var(--bg-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 2.5rem 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
      position: relative;
    }

    .graph-node {
      border-radius: var(--radius-sm);
      padding: 1rem 1.5rem;
      box-shadow: 0 4px 15px rgba(0,0,0,0.5);
      border: 1px solid transparent;
      text-align: center;
    }

    .central-node {
      background: var(--bg-surface);
      min-width: 280px;
    }

    .central-node.node-high {
      border-color: #ef4444;
      box-shadow: 0 0 20px rgba(239, 68, 68, 0.25);
    }

    .central-node.node-medium {
      border-color: #f59e0b;
      box-shadow: 0 0 20px rgba(245, 158, 11, 0.25);
    }

    .central-node.node-low {
      border-color: #10b981;
      box-shadow: 0 0 20px rgba(16, 185, 129, 0.25);
    }

    .node-tag {
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--text-dim);
      letter-spacing: 0.05em;
    }

    .node-title {
      font-family: 'JetBrains Mono', monospace;
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-main);
      margin: 0.25rem 0;
    }

    .node-meta {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: 600;
    }

    .node-claim {
      font-size: 0.8rem;
      color: #2563eb;
      margin-top: 0.25rem;
    }

    .connected-nodes-wrap {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 2rem;
      width: 100%;
    }

    .graph-link-branch {
      display: flex;
      flex-direction: column;
      align-items: center;
      max-width: 260px;
    }

    .link-connector {
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 60px;
      justify-content: space-between;
    }

    .connector-line {
      width: 2px;
      height: 15px;
      background: #3b82f6;
    }

    .connector-label {
      font-size: 0.65rem;
      font-weight: 700;
      padding: 0.15rem 0.5rem;
      border-radius: var(--radius-full);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .doc-node {
      background: #f0f5ff;
      border-color: #bfdbfe;
      width: 100%;
    }

    .doc-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      margin-bottom: 0.35rem;
    }

    .doc-type-tag {
      font-size: 0.7rem;
      font-weight: 700;
      color: #1d4ed8;
    }

    .doc-id {
      font-size: 0.7rem;
      color: var(--text-dim);
    }

    .doc-filename {
      font-size: 0.8rem;
      color: var(--text-main);
      word-break: break-all;
      margin-bottom: 0.35rem;
    }

    .doc-hash {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.7rem;
      color: var(--text-muted);
    }

    .no-evidence-box {
      color: var(--text-dim);
      font-size: 0.85rem;
      padding: 1rem;
    }

    .finding-details-box {
      background: var(--bg-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 1rem;
    }

    .finding-details-box h4 {
      margin: 0 0 0.4rem;
      font-size: 0.9rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .finding-details-box p {
      margin: 0;
      font-size: 0.9rem;
      color: var(--text-main);
      line-height: 1.5;
    }

    .audit-history-box {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .audit-history-box h4 {
      margin: 0;
      font-size: 0.9rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .timeline {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding-left: 0.5rem;
      border-left: 2px solid var(--border-subtle);
      margin-left: 0.5rem;
    }

    .timeline-entry {
      position: relative;
      padding-left: 1.25rem;
    }

    .timeline-dot {
      position: absolute;
      left: -9px;
      top: 4px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #3b82f6;
      border: 2px solid #f8fafc;
    }

    .timeline-content {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      background: var(--bg-elevated);
      padding: 0.75rem 1rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-subtle);
    }

    .timeline-header {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.8rem;
    }

    .act-type {
      font-weight: 700;
      color: #2563eb;
    }

    .act-user {
      color: var(--text-muted);
    }

    .act-time {
      color: var(--text-dim);
      margin-left: auto;
    }

    .act-exp {
      margin: 0;
      font-size: 0.85rem;
      color: var(--text-main);
      font-style: italic;
    }

    .act-transition {
      font-size: 0.75rem;
      color: var(--text-dim);
    }

    .empty-timeline {
      font-size: 0.85rem;
      color: var(--text-dim);
      padding: 0.5rem 0;
    }

    .alert-banner {
      padding: 0.75rem 1.25rem;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.875rem;
    }

    .alert-banner.success {
      background: #f0fdf4;
      border: 1px solid #86efac;
      color: #166534;
    }

    .alert-banner.danger {
      background: #fef2f2;
      border: 1px solid #fca5a5;
      color: #991b1b;
    }

    .close-alert {
      background: transparent;
      border: none;
      color: inherit;
      font-size: 1.25rem;
      cursor: pointer;
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
export class FindingsComponent implements OnInit {
  findings: Finding[] = [];
  selectedStatus: FindingStatus | undefined = undefined;
  selectedSeverity: FindingSeverity | undefined = undefined;
  loading = false;

  alertMessage: string | null = null;
  alertType: 'success' | 'danger' = 'success';

  // Evidence Graph & Detail Modal
  graphFinding: Finding | null = null;
  findingActions: InvestigationAction[] = [];

  // Assign Modal
  assigningFinding: Finding | null = null;
  investigators: User[] = [];
  selectedUserId = 0;
  submittingAssign = false;

  // Action Modal
  actingFinding: Finding | null = null;
  actionRequest: InvestigationActionRequest = {
    actionType: 'COMMENT',
    explanation: '',
    newStatus: undefined
  };
  submittingAction = false;

  constructor(
    private findingService: FindingService,
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadFindings();
    this.loadInvestigators();
  }

  get isAdmin(): boolean {
    return this.authService.currentUser()?.role === 'ADMIN';
  }

  get canTakeAction(): boolean {
    const role = this.authService.currentUser()?.role;
    return role === 'ADMIN' || role === 'INVESTIGATOR';
  }

  loadFindings(): void {
    this.loading = true;
    this.findingService.getFindings({
      status: this.selectedStatus,
      severity: this.selectedSeverity,
      size: 50
    }).subscribe({
      next: (res) => {
        this.findings = res.content;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.showAlert(err.error?.message || 'Failed to load findings', 'danger');
      }
    });
  }

  loadInvestigators(): void {
    if (this.isAdmin) {
      this.userService.getUsers('', 0, 50).subscribe({
        next: (res) => {
          this.investigators = res.content;
        }
      });
    }
  }

  setStatusFilter(status: FindingStatus | undefined): void {
    this.selectedStatus = status;
    this.loadFindings();
  }

  setSeverityFilter(severity: FindingSeverity | undefined): void {
    this.selectedSeverity = severity;
    this.loadFindings();
  }

  openEvidenceGraphModal(f: Finding): void {
    this.graphFinding = f;
    this.findingActions = [];
    this.findingService.getActionsForFinding(f.findingId).subscribe({
      next: (actions) => {
        this.findingActions = actions;
      }
    });
  }

  openAssignModal(f: Finding): void {
    this.assigningFinding = f;
    this.selectedUserId = f.assignedTo?.userId || 0;
  }

  submitAssign(): void {
    if (!this.assigningFinding || !this.selectedUserId) return;

    this.submittingAssign = true;
    this.findingService.assignFinding(this.assigningFinding.findingId, this.selectedUserId).subscribe({
      next: (updated) => {
        this.submittingAssign = false;
        this.assigningFinding = null;
        this.showAlert(`Finding #${updated.findingId} successfully assigned to ${updated.assignedTo?.name || 'investigator'}!`, 'success');
        this.loadFindings();
      },
      error: (err) => {
        this.submittingAssign = false;
        this.showAlert(err.error?.message || 'Failed to assign finding', 'danger');
      }
    });
  }

  openActionModal(f: Finding): void {
    this.actingFinding = f;
    this.actionRequest = {
      actionType: 'COMMENT',
      explanation: '',
      newStatus: f.status
    };
  }

  onActionTypeChange(): void {
    if (this.actionRequest.actionType === 'RESOLVE') {
      this.actionRequest.newStatus = 'RESOLVED';
    } else if (this.actionRequest.actionType === 'DISMISS') {
      this.actionRequest.newStatus = 'DISMISSED';
    } else if (this.actionRequest.actionType === 'REOPEN') {
      this.actionRequest.newStatus = 'OPEN';
    }
  }

  submitAction(): void {
    if (!this.actingFinding || !this.actionRequest.explanation) return;

    this.submittingAction = true;
    this.findingService.addAction(this.actingFinding.findingId, this.actionRequest).subscribe({
      next: (action) => {
        this.submittingAction = false;
        this.actingFinding = null;
        this.showAlert(`Action ${action.actionType} recorded! New status: ${action.newStatus}`, 'success');
        this.loadFindings();
      },
      error: (err) => {
        this.submittingAction = false;
        this.showAlert(err.error?.message || 'Action recording failed', 'danger');
      }
    });
  }

  private showAlert(message: string, type: 'success' | 'danger'): void {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => {
      if (this.alertMessage === message) {
        this.alertMessage = null;
      }
    }, 6000);
  }
}
