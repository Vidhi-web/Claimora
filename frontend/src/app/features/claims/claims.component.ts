import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClaimService } from '../../services/claim.service';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../core/auth/auth.service';
import { Claim, ClaimRequest, ClaimStatus, AnalysisResultResponse } from '../../models/claim.model';
import { Product } from '../../models/product.model';
import { EvidenceDocument, DocumentType } from '../../models/evidence.model';

@Component({
  selector: 'app-claims',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <!-- Page Header -->
      <header class="page-header">
        <div>
          <div class="badge-tag">Operations & Fraud Detection</div>
          <h1>Warranty Claims Intake & Analysis</h1>
          <p class="subtitle">Inspect claims, verify warranty integrity, and trigger automated forensic analysis.</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-primary" (click)="openCreateModal()" *ngIf="canCreateClaim">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Submit New Claim
          </button>
        </div>
      </header>

      <!-- Filter & Search Toolbar -->
      <div class="claimora-card toolbar-card">
        <div class="search-box">
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input
            type="text"
            placeholder="Search by claim number, claimant, or issue..."
            [(ngModel)]="searchQuery"
            (keyup.enter)="loadClaims()"
          />
        </div>

        <div class="filter-tabs">
          <button
            class="tab-btn"
            [class.active]="selectedStatus === undefined"
            (click)="setStatusFilter(undefined)"
          >
            All
          </button>
          <button
            class="tab-btn"
            [class.active]="selectedStatus === 'SUBMITTED'"
            (click)="setStatusFilter('SUBMITTED')"
          >
            Submitted
          </button>
          <button
            class="tab-btn"
            [class.active]="selectedStatus === 'UNDER_REVIEW'"
            (click)="setStatusFilter('UNDER_REVIEW')"
          >
            Under Review
          </button>
          <button
            class="tab-btn"
            [class.active]="selectedStatus === 'FLAGGED'"
            (click)="setStatusFilter('FLAGGED')"
          >
            <span class="dot-flagged"></span> Flagged
          </button>
          <button
            class="tab-btn"
            [class.active]="selectedStatus === 'RESOLVED'"
            (click)="setStatusFilter('RESOLVED')"
          >
            Resolved
          </button>
        </div>
      </div>

      <!-- Feedback / Alert Message -->
      <div *ngIf="alertMessage" class="alert-banner" [ngClass]="alertType">
        <span>{{ alertMessage }}</span>
        <button (click)="alertMessage = null" class="close-alert">&times;</button>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <span>Loading warranty claims...</span>
      </div>

      <!-- Claims Table -->
      <div *ngIf="!loading" class="claimora-card table-card">
        <table class="data-table" *ngIf="claims.length > 0; else noClaims">
          <thead>
            <tr>
              <th>Claim Number</th>
              <th>Product / Serial</th>
              <th>Claimant</th>
              <th>Claim Date</th>
              <th>Findings</th>
              <th>Status</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of claims">
              <td>
                <span class="claim-badge" (click)="openDetail(c)">{{ c.claimNumber }}</span>
              </td>
              <td>
                <div class="product-info">
                  <span class="product-model">{{ c.productModel || 'Product #' + c.productId }}</span>
                  <code class="serial-code">{{ c.productSerialNumber || 'N/A' }}</code>
                </div>
              </td>
              <td>
                <div class="claimant-info">
                  <span class="claimant-name">{{ c.claimantName || 'Claimant' }}</span>
                  <span class="claimant-email">{{ c.claimantEmail || '—' }}</span>
                </div>
              </td>
              <td>
                <span class="date-text">{{ c.claimDate | date:'mediumDate' }}</span>
              </td>
              <td>
                <span *ngIf="c.openFindingsCount && c.openFindingsCount > 0" class="findings-badge">
                  ⚠️ {{ c.openFindingsCount }} Active
                </span>
                <span *ngIf="!c.openFindingsCount || c.openFindingsCount === 0" class="no-findings-badge">
                  ✓ None
                </span>
              </td>
              <td>
                <span class="pill" [ngClass]="'pill-' + c.status.toLowerCase().replace('_', '-')">
                  {{ c.status }}
                </span>
              </td>
              <td style="text-align: right;">
                <div class="table-actions">
                  <button class="btn btn-secondary btn-sm" (click)="openDetail(c)">
                    Inspect
                  </button>
                  <button
                    class="btn btn-primary btn-sm analyze-btn"
                    [disabled]="analyzingClaimId === c.claimId"
                    (click)="triggerAnalysis(c)"
                  >
                    <span *ngIf="analyzingClaimId === c.claimId" class="spinner" style="width:12px; height:12px;"></span>
                    <span *ngIf="analyzingClaimId !== c.claimId">⚡ Analyze</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <ng-template #noClaims>
          <div class="empty-state">
            <div class="empty-icon">📋</div>
            <h3>No Claims Found</h3>
            <p>No warranty claims match the current search query or status filter.</p>
            <button class="btn btn-secondary btn-sm" (click)="resetFilters()">Reset Filters</button>
          </div>
        </ng-template>

        <!-- Pagination Footer -->
        <div class="pagination-footer" *ngIf="totalPages > 1">
          <span class="pagination-info">Showing page {{ currentPage + 1 }} of {{ totalPages }} ({{ totalElements }} claims)</span>
          <div class="pagination-buttons">
            <button class="btn btn-secondary btn-sm" [disabled]="currentPage === 0" (click)="goToPage(currentPage - 1)">
              Previous
            </button>
            <button class="btn btn-secondary btn-sm" [disabled]="currentPage >= totalPages - 1" (click)="goToPage(currentPage + 1)">
              Next
            </button>
          </div>
        </div>
      </div>

      <!-- CREATE CLAIM MODAL -->
      <div class="modal-overlay" *ngIf="showCreateModal">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3>Submit New Warranty Claim</h3>
            <button class="modal-close" (click)="showCreateModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Select Covered Product *</label>
              <select class="form-control" [(ngModel)]="newClaim.productId">
                <option [ngValue]="0" disabled>Select registered product...</option>
                <option *ngFor="let p of availableProducts" [ngValue]="p.productId">
                  {{ p.model }} — (SN: {{ p.serialNumber }})
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Claim Number *</label>
              <input
                type="text"
                class="form-control"
                [(ngModel)]="newClaim.claimNumber"
                placeholder="e.g. CLM-2026-000199"
              />
            </div>

            <div class="form-group">
              <label>Claim Date</label>
              <input
                type="date"
                class="form-control"
                [(ngModel)]="newClaim.claimDate"
              />
            </div>

            <div class="form-group">
              <label>Issue Description *</label>
              <textarea
                class="form-control"
                rows="4"
                [(ngModel)]="newClaim.issueDescription"
                placeholder="Describe failure symptoms, customer report, and defect details..."
              ></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="showCreateModal = false">Cancel</button>
            <button
              class="btn btn-primary"
              [disabled]="submittingClaim || !newClaim.productId || !newClaim.claimNumber || !newClaim.issueDescription"
              (click)="submitClaim()"
            >
              <span *ngIf="submittingClaim" class="spinner"></span>
              <span>Submit Claim</span>
            </button>
          </div>
        </div>
      </div>

      <!-- CLAIM DETAIL & ANALYSIS DRAWER / MODAL -->
      <div class="modal-overlay" *ngIf="selectedClaim">
        <div class="modal-dialog detail-dialog">
          <div class="modal-header">
            <div class="detail-header-left">
              <h3>Claim {{ selectedClaim.claimNumber }}</h3>
              <span class="pill" [ngClass]="'pill-' + selectedClaim.status.toLowerCase().replace('_', '-')">
                {{ selectedClaim.status }}
              </span>
            </div>
            <button class="modal-close" (click)="closeDetail()">&times;</button>
          </div>

          <div class="modal-body">
            <!-- Metadata Summary -->
            <div class="detail-meta-grid">
              <div class="meta-item">
                <span class="meta-label">Product Model</span>
                <span class="meta-value">{{ selectedClaim.productModel || 'ID: ' + selectedClaim.productId }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Serial Number</span>
                <code class="meta-value serial-code">{{ selectedClaim.productSerialNumber || 'N/A' }}</code>
              </div>
              <div class="meta-item">
                <span class="meta-label">Claimant</span>
                <span class="meta-value">{{ selectedClaim.claimantName || 'Claimant' }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Claim Date</span>
                <span class="meta-value">{{ selectedClaim.claimDate | date:'mediumDate' }}</span>
              </div>
            </div>

            <div class="issue-box">
              <span class="meta-label">Reported Issue Description</span>
              <p class="issue-text">{{ selectedClaim.issueDescription }}</p>
            </div>

            <!-- Fraud Risk Engine Action Section -->
            <div class="analysis-action-box">
              <div class="analysis-action-info">
                <h4>Fraud Risk Engine</h4>
                <p>Execute cross-claim OCR invoice hashing, serial reuse checks, and date window verification.</p>
              </div>
              <button
                class="btn btn-primary"
                [disabled]="analyzingClaimId === selectedClaim.claimId"
                (click)="triggerAnalysis(selectedClaim)"
              >
                <span *ngIf="analyzingClaimId === selectedClaim.claimId" class="spinner"></span>
                <span>⚡ Run Fraud Analysis</span>
              </button>
            </div>

            <!-- Analysis Result Panel -->
            <div *ngIf="latestAnalysisResult" class="analysis-result-panel" [ngClass]="'risk-' + latestAnalysisResult.riskLevel.toLowerCase()">
              <div class="result-header">
                <div class="risk-badge">
                  <span class="score-number">{{ latestAnalysisResult.score }}</span>
                  <span class="risk-title">{{ latestAnalysisResult.riskLevel }} RISK</span>
                </div>
                <div class="result-metrics">
                  <div><strong>Findings Created:</strong> {{ latestAnalysisResult.findingsCreated }}</div>
                  <div><strong>Active Findings:</strong> {{ latestAnalysisResult.activeFindingsCount }}</div>
                  <div><strong>Rules Triggered:</strong> {{ latestAnalysisResult.triggeredRuleCodes.join(', ') || 'None' }}</div>
                </div>
              </div>

              <div *ngIf="latestAnalysisResult.findings.length > 0" class="findings-list">
                <h5>Discovered Discrepancies & Findings</h5>
                <div *ngFor="let f of latestAnalysisResult.findings" class="finding-item-card">
                  <div class="finding-top">
                    <span class="rule-tag">{{ f.ruleCode }}</span>
                    <span class="pill" [ngClass]="'pill-' + f.severity.toLowerCase()">{{ f.severity }}</span>
                    <span class="pill" [ngClass]="'pill-' + f.status.toLowerCase().replace('_', '-')">{{ f.status }}</span>
                  </div>
                  <p class="finding-desc">{{ f.description }}</p>
                  <div *ngIf="f.linkedDocuments && f.linkedDocuments.length > 0" class="linked-docs-strip">
                    <span class="strip-label">Linked Evidence:</span>
                    <span *ngFor="let ld of f.linkedDocuments" class="role-badge" [ngClass]="ld.evidenceRole.toLowerCase().replace('_', '-')">
                      {{ ld.documentType }} ({{ ld.evidenceRole }})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Attached Evidence Documents -->
            <div class="evidence-section">
              <div class="section-header">
                <h4>Supporting Evidence Documents ({{ claimDocuments.length }})</h4>
                <button class="btn btn-secondary btn-sm" (click)="showUploadForm = !showUploadForm" *ngIf="canCreateClaim">
                  + Add Document
                </button>
              </div>

              <!-- Upload Document Form -->
              <div *ngIf="showUploadForm" class="upload-inline-card">
                <div class="form-group">
                  <label>Document Type *</label>
                  <select class="form-control" [(ngModel)]="uploadDocType">
                    <option value="INVOICE">Invoice</option>
                    <option value="PHOTO">Damage Photo</option>
                    <option value="REPAIR_REPORT">Repair Report</option>
                    <option value="PARTS_INVOICE">Parts Invoice</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Select File (PDF, PNG, JPG) *</label>
                  <input type="file" (change)="onFileSelected($event)" class="form-control" />
                </div>
                <div class="upload-actions">
                  <button class="btn btn-secondary btn-sm" (click)="showUploadForm = false">Cancel</button>
                  <button class="btn btn-primary btn-sm" [disabled]="!selectedFile || uploadingDoc" (click)="uploadEvidence()">
                    <span *ngIf="uploadingDoc" class="spinner"></span>
                    <span>Upload & Process OCR</span>
                  </button>
                </div>
              </div>

              <!-- Documents Table -->
              <table class="data-table" *ngIf="claimDocuments.length > 0; else noDocs">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>File</th>
                    <th>Fingerprint (SHA-256)</th>
                    <th>OCR Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let doc of claimDocuments">
                    <td>
                      <span class="doc-pill">{{ doc.documentType }}</span>
                    </td>
                    <td>
                      <div class="file-name">{{ doc.originalFilename || 'document_' + doc.documentId }}</div>
                    </td>
                    <td>
                      <code class="hash-code" [title]="doc.fileHash">{{ doc.fileHash | slice:0:16 }}...</code>
                    </td>
                    <td>
                      <span class="ocr-status" [ngClass]="'ocr-' + doc.ocrStatus.toLowerCase()">
                        {{ doc.ocrStatus }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
              <ng-template #noDocs>
                <div class="empty-docs-note">No documents uploaded for this claim yet.</div>
              </ng-template>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeDetail()">Close</button>
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

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1.5rem;
    }

    .badge-tag {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 700;
      color: #60a5fa;
      background: rgba(59, 130, 246, 0.15);
      border: 1px solid rgba(59, 130, 246, 0.3);
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
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      padding: 1rem 1.5rem;
      flex-wrap: wrap;
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 0.5rem 0.85rem;
      color: var(--text-muted);
      flex: 1;
      min-width: 280px;
      max-width: 480px;
    }

    .search-box input {
      background: transparent;
      border: none;
      color: var(--text-main);
      font-size: 0.9rem;
      width: 100%;
      outline: none;
    }

    .filter-tabs {
      display: flex;
      gap: 0.4rem;
      background: var(--bg-surface);
      padding: 0.25rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-subtle);
    }

    .tab-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      padding: 0.4rem 0.85rem;
      font-size: 0.825rem;
      font-weight: 600;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .tab-btn:hover {
      color: var(--text-main);
    }

    .tab-btn.active {
      background: #2563eb;
      color: #ffffff;
      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    }

    .dot-flagged {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #ef4444;
      display: inline-block;
    }

    .table-card {
      padding: 0;
      overflow: hidden;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;
    }

    .data-table th, .data-table td {
      padding: 0.9rem 1.25rem;
      text-align: left;
      border-bottom: 1px solid var(--border-subtle);
    }

    .data-table th {
      background: var(--bg-elevated);
      color: var(--text-muted);
      font-weight: 600;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      border-bottom: 2px solid var(--border-subtle);
    }

    .data-table tr:hover td {
      background: var(--bg-elevated);
    }

    .claim-badge {
      font-family: 'JetBrains Mono', monospace;
      color: var(--primary);
      font-weight: 600;
      cursor: pointer;
      text-decoration: underline;
      text-decoration-color: transparent;
      transition: text-decoration-color 0.15s ease;
    }

    .claim-badge:hover {
      text-decoration-color: #60a5fa;
    }

    .product-info {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .product-model {
      font-weight: 600;
      color: var(--text-main);
    }

    .serial-code {
      font-size: 0.75rem;
      color: #94a3b8;
      background: #0d131f;
      padding: 0.1rem 0.35rem;
      border-radius: 4px;
      width: fit-content;
    }

    .claimant-info {
      display: flex;
      flex-direction: column;
    }

    .claimant-name {
      font-weight: 500;
      color: var(--text-main);
    }

    .claimant-email {
      font-size: 0.75rem;
      color: var(--text-dim);
    }

    .date-text {
      color: var(--text-muted);
      font-size: 0.875rem;
    }

    .findings-badge {
      font-size: 0.75rem;
      font-weight: 700;
      color: #f87171;
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-full);
    }

    .no-findings-badge {
      font-size: 0.75rem;
      color: #10b981;
      font-weight: 500;
    }

    .table-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.5rem;
    }

    .analyze-btn {
      background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
      box-shadow: 0 2px 8px rgba(139, 92, 246, 0.25);
    }

    .analyze-btn:hover:not(:disabled) {
      background: linear-gradient(135deg, #a78bfa 0%, #818cf8 100%);
    }

    .empty-state {
      padding: 4rem 2rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      color: var(--text-muted);
    }

    .empty-icon {
      font-size: 2.5rem;
    }

    .pagination-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.875rem 1.25rem;
      background: var(--bg-elevated);
      border-top: 1px solid var(--border-subtle);
    }

    .pagination-info {
      font-size: 0.825rem;
      color: var(--text-muted);
    }

    .pagination-buttons {
      display: flex;
      gap: 0.5rem;
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
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.35);
      color: #6ee7b7;
    }

    .alert-banner.danger {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.35);
      color: #fca5a5;
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

    /* Detail Modal Specifics */
    .detail-dialog {
      max-width: 850px;
    }

    .detail-header-left {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .detail-meta-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
      background: var(--bg-elevated);
      padding: 1.125rem;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-subtle);
    }

    .meta-item {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .meta-label {
      font-size: 0.75rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      font-weight: 600;
    }

    .meta-value {
      font-size: 0.9375rem;
      color: var(--text-main);
      font-weight: 600;
    }

    .issue-box {
      background: var(--bg-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 1rem 1.125rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .issue-text {
      margin: 0;
      color: var(--text-main);
      font-size: 0.9375rem;
      line-height: 1.65;
    }

    .analysis-action-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      background: #f5f3ff;
      border: 1px solid #ddd6fe;
      padding: 1.25rem;
      border-radius: var(--radius-md);
    }

    .analysis-action-info h4 {
      margin: 0;
      color: #6d28d9;
      font-size: 1rem;
      font-weight: 700;
    }

    .analysis-action-info p {
      margin: 0.25rem 0 0;
      font-size: 0.875rem;
      color: var(--text-muted);
    }

    .analysis-result-panel {
      border-radius: var(--radius-sm);
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      border: 1px solid transparent;
    }

    .analysis-result-panel.risk-critical,
    .analysis-result-panel.risk-high {
      background: rgba(239, 68, 68, 0.1);
      border-color: rgba(239, 68, 68, 0.3);
    }

    .analysis-result-panel.risk-medium {
      background: rgba(245, 158, 11, 0.1);
      border-color: rgba(245, 158, 11, 0.3);
    }

    .analysis-result-panel.risk-low {
      background: rgba(16, 185, 129, 0.1);
      border-color: rgba(16, 185, 129, 0.3);
    }

    .result-header {
      display: flex;
      align-items: center;
      gap: 2rem;
      flex-wrap: wrap;
    }

    .risk-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: var(--bg-elevated);
      border-radius: var(--radius-md);
      padding: 0.875rem 1.375rem;
      border: 1px solid var(--border-subtle);
    }

    .score-number {
      font-size: 2rem;
      font-weight: 800;
      line-height: 1;
    }

    .risk-critical .score-number,
    .risk-high .score-number {
      color: #ef4444;
    }

    .risk-medium .score-number {
      color: #f59e0b;
    }

    .risk-low .score-number {
      color: #10b981;
    }

    .risk-title {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-muted);
      letter-spacing: 0.05em;
      margin-top: 0.25rem;
    }

    .result-metrics {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      font-size: 0.875rem;
      color: var(--text-main);
    }

    .findings-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .findings-list h5 {
      margin: 0;
      font-size: 0.875rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .finding-item-card {
      background: var(--bg-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 1rem 1.125rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .finding-top {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .rule-tag {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
      font-weight: 700;
      color: #6d28d9;
      background: #f5f3ff;
      border: 1px solid #ddd6fe;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
    }

    .finding-desc {
      margin: 0;
      font-size: 0.875rem;
      color: var(--text-main);
      line-height: 1.6;
    }

    .linked-docs-strip {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      flex-wrap: wrap;
    }

    .strip-label {
      font-size: 0.75rem;
      color: var(--text-dim);
    }

    .evidence-section {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-top: 0.5rem;
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .section-header h4 {
      margin: 0;
      font-size: 0.95rem;
      color: var(--text-main);
    }

    .upload-inline-card {
      background: var(--primary-light, #eff6ff);
      border: 1px dashed var(--primary);
      border-radius: var(--radius-md);
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .upload-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
    }

    .doc-pill {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
      background: var(--info-bg);
      color: var(--info-text);
      border: 1px solid var(--info-border);
    }

    .file-name {
      font-size: 0.825rem;
      color: var(--text-main);
    }

    .hash-code {
      font-size: 0.75rem;
      color: var(--text-muted);
      background: var(--bg-elevated);
      border: 1px solid var(--border-subtle);
      padding: 0.1rem 0.35rem;
      border-radius: 4px;
      font-family: 'JetBrains Mono', monospace;
    }

    .ocr-status {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.15rem 0.45rem;
      border-radius: 9999px;
      text-transform: uppercase;
    }

    .ocr-status.ocr-processed {
      background: var(--success-bg);
      color: var(--success-text);
      border: 1px solid var(--success-border);
    }

    .ocr-status.ocr-manual {
      background: var(--warning-bg);
      color: var(--warning-text);
      border: 1px solid var(--warning-border);
    }

    .ocr-status.ocr-failed {
      background: var(--danger-bg);
      color: var(--danger-text);
      border: 1px solid var(--danger-border);
    }

    .ocr-status.ocr-pending {
      background: var(--bg-elevated);
      color: var(--text-muted);
      border: 1px solid var(--border-subtle);
    }

    .empty-docs-note {
      padding: 1.25rem;
      background: var(--bg-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      color: var(--text-muted);
      font-size: 0.875rem;
      text-align: center;
    }
  `]
})
export class ClaimsComponent implements OnInit {
  claims: Claim[] = [];
  totalElements = 0;
  totalPages = 0;
  currentPage = 0;
  pageSize = 10;
  searchQuery = '';
  selectedStatus: ClaimStatus | undefined = undefined;

  loading = false;
  alertMessage: string | null = null;
  alertType: 'success' | 'danger' = 'success';

  // Detail Modal & Documents
  selectedClaim: Claim | null = null;
  claimDocuments: EvidenceDocument[] = [];
  analyzingClaimId: number | null = null;
  latestAnalysisResult: AnalysisResultResponse | null = null;

  // New Claim Modal
  showCreateModal = false;
  submittingClaim = false;
  availableProducts: Product[] = [];
  newClaim: ClaimRequest = {
    productId: 0,
    claimNumber: '',
    claimDate: new Date().toISOString().substring(0, 10),
    issueDescription: ''
  };

  // Upload Document
  showUploadForm = false;
  uploadingDoc = false;
  uploadDocType: DocumentType = 'INVOICE';
  selectedFile: File | null = null;

  constructor(
    private claimService: ClaimService,
    private productService: ProductService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadClaims();
    this.loadProducts();
  }

  get canCreateClaim(): boolean {
    const role = this.authService.currentUser()?.role;
    return role === 'ADMIN' || role === 'STAFF';
  }

  loadClaims(): void {
    this.loading = true;
    this.claimService.getClaims({
      search: this.searchQuery,
      status: this.selectedStatus,
      page: this.currentPage,
      size: this.pageSize
    }).subscribe({
      next: (res) => {
        this.claims = res.content;
        this.totalElements = res.totalElements;
        this.totalPages = res.totalPages;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.showAlert(err.error?.message || 'Failed to load claims', 'danger');
      }
    });
  }

  loadProducts(): void {
    this.productService.getProducts('', 0, 50).subscribe({
      next: (res) => {
        this.availableProducts = res.content;
      }
    });
  }

  setStatusFilter(status: ClaimStatus | undefined): void {
    this.selectedStatus = status;
    this.currentPage = 0;
    this.loadClaims();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedStatus = undefined;
    this.currentPage = 0;
    this.loadClaims();
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadClaims();
  }

  openCreateModal(): void {
    this.newClaim = {
      productId: this.availableProducts.length > 0 ? this.availableProducts[0].productId : 0,
      claimNumber: 'CLM-2026-' + Math.floor(100000 + Math.random() * 900000),
      claimDate: new Date().toISOString().substring(0, 10),
      issueDescription: ''
    };
    this.showCreateModal = true;
  }

  submitClaim(): void {
    if (!this.newClaim.productId || !this.newClaim.claimNumber || !this.newClaim.issueDescription) {
      return;
    }
    this.submittingClaim = true;
    this.claimService.createClaim(this.newClaim).subscribe({
      next: (created) => {
        this.submittingClaim = false;
        this.showCreateModal = false;
        this.showAlert(`Claim ${created.claimNumber} created successfully!`, 'success');
        this.loadClaims();
      },
      error: (err) => {
        this.submittingClaim = false;
        this.showAlert(err.error?.message || 'Failed to create claim', 'danger');
      }
    });
  }

  openDetail(claim: Claim): void {
    this.selectedClaim = claim;
    this.latestAnalysisResult = null;
    this.showUploadForm = false;
    this.selectedFile = null;
    this.loadClaimDocuments(claim.claimId);
  }

  closeDetail(): void {
    this.selectedClaim = null;
    this.claimDocuments = [];
    this.latestAnalysisResult = null;
  }

  loadClaimDocuments(claimId: number): void {
    this.claimService.getClaimDocuments(claimId).subscribe({
      next: (docs) => {
        this.claimDocuments = docs;
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  uploadEvidence(): void {
    if (!this.selectedClaim || !this.selectedFile) return;

    this.uploadingDoc = true;
    this.claimService.uploadDocument(this.selectedClaim.claimId, this.selectedFile, this.uploadDocType).subscribe({
      next: (doc) => {
        this.uploadingDoc = false;
        this.showUploadForm = false;
        this.selectedFile = null;
        this.showAlert(`Document ${doc.originalFilename} uploaded and processed via OCR!`, 'success');
        this.loadClaimDocuments(this.selectedClaim!.claimId);
      },
      error: (err) => {
        this.uploadingDoc = false;
        this.showAlert(err.error?.message || 'Failed to upload document', 'danger');
      }
    });
  }

  triggerAnalysis(claim: Claim): void {
    this.analyzingClaimId = claim.claimId;
    this.claimService.analyzeClaim(claim.claimId).subscribe({
      next: (res) => {
        this.analyzingClaimId = null;
        this.latestAnalysisResult = res;

        // If the claim detail modal is open, update status
        if (this.selectedClaim && this.selectedClaim.claimId === claim.claimId) {
          this.selectedClaim.status = res.claimStatus as ClaimStatus;
          this.selectedClaim.openFindingsCount = res.activeFindingsCount;
        }

        // Also update in list
        const idx = this.claims.findIndex(c => c.claimId === claim.claimId);
        if (idx !== -1) {
          this.claims[idx].status = res.claimStatus as ClaimStatus;
          this.claims[idx].openFindingsCount = res.activeFindingsCount;
        }

        this.showAlert(`Analysis complete for ${res.claimNumber}! Score: ${res.score} (${res.riskLevel} Risk, ${res.findingsCreated} new findings created)`, 'success');
      },
      error: (err) => {
        this.analyzingClaimId = null;
        this.showAlert(err.error?.message || 'Analysis failed', 'danger');
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
