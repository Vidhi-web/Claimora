import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EvidenceService } from '../../services/evidence.service';
import { ClaimService } from '../../services/claim.service';
import { AuthService } from '../../core/auth/auth.service';
import { EvidenceDocument, DocumentType, UpdateExtractedDataRequest } from '../../models/evidence.model';
import { Claim } from '../../models/claim.model';

@Component({
  selector: 'app-evidence',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <!-- Page Header -->
      <header class="page-header">
        <div>
          <div class="badge-tag">Digital Forensics & Storage</div>
          <h1>Evidence Document Explorer</h1>
          <p class="subtitle">Cryptographically fingerprinted evidence documents, automated OCR extraction, and tamper audit trails.</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-primary" (click)="openUploadModal()" *ngIf="canUpload">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
            </svg>
            Upload Evidence
          </button>
        </div>
      </header>

      <!-- Toolbar -->
      <div class="claimora-card toolbar-card">
        <div class="search-box">
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input
            type="text"
            placeholder="Search by file name, SHA-256 hash, or claim..."
            [(ngModel)]="searchQuery"
          />
        </div>

        <div class="filter-group">
          <label>Filter by Claim:</label>
          <select class="form-control select-claim" [(ngModel)]="selectedClaimFilter" (change)="loadDocuments()">
            <option [ngValue]="null">All Claims</option>
            <option *ngFor="let c of claims" [ngValue]="c.claimId">
              {{ c.claimNumber }} ({{ c.productModel || 'Claim #' + c.claimId }})
            </option>
          </select>
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
        <span>Loading evidence documents...</span>
      </div>

      <!-- Evidence Documents Table -->
      <div *ngIf="!loading" class="claimora-card table-card">
        <table class="data-table" *ngIf="filteredDocuments.length > 0; else noDocs">
          <thead>
            <tr>
              <th>Doc ID</th>
              <th>Type</th>
              <th>Original File</th>
              <th>SHA-256 Fingerprint</th>
              <th>Claim Reference</th>
              <th>OCR Status</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let doc of filteredDocuments">
              <td>
                <span class="id-dim">#{{ doc.documentId }}</span>
              </td>
              <td>
                <span class="doc-badge" [ngClass]="doc.documentType.toLowerCase()">
                  {{ doc.documentType }}
                </span>
              </td>
              <td>
                <div class="file-cell">
                  <span class="file-name">{{ doc.originalFilename || 'document_' + doc.documentId }}</span>
                  <span class="file-meta" *ngIf="doc.fileSize">{{ (doc.fileSize / 1024) | number:'1.1-1' }} KB &bull; {{ doc.mimeType || 'binary' }}</span>
                </div>
              </td>
              <td>
                <div class="hash-cell">
                  <code class="hash-code" [title]="doc.fileHash">{{ doc.fileHash | slice:0:18 }}...</code>
                  <button class="copy-btn" (click)="copyHash(doc.fileHash)" title="Copy SHA-256">📋</button>
                </div>
              </td>
              <td>
                <span class="claim-ref">Claim #{{ doc.claimId }}</span>
              </td>
              <td>
                <span class="ocr-status" [ngClass]="'ocr-' + doc.ocrStatus.toLowerCase()">
                  {{ doc.ocrStatus }}
                </span>
              </td>
              <td style="text-align: right;">
                <div class="table-actions">
                  <button class="btn btn-secondary btn-sm" (click)="downloadFile(doc)" title="Download original evidence file">
                    ⬇ File
                  </button>
                  <button class="btn btn-primary btn-sm" (click)="openOcrModal(doc)">
                    ⚙ OCR Data
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <ng-template #noDocs>
          <div class="empty-state">
            <div class="empty-icon">📁</div>
            <h3>No Evidence Documents</h3>
            <p>No documents uploaded yet or matching the filter criteria.</p>
          </div>
        </ng-template>
      </div>

      <!-- UPLOAD EVIDENCE MODAL -->
      <div class="modal-overlay" *ngIf="showUploadModal">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3>Upload Supporting Evidence Document</h3>
            <button class="modal-close" (click)="showUploadModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Associate with Claim *</label>
              <select class="form-control" [(ngModel)]="uploadClaimId">
                <option [ngValue]="0" disabled>Select claim...</option>
                <option *ngFor="let c of claims" [ngValue]="c.claimId">
                  {{ c.claimNumber }} — {{ c.productModel }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Evidence Document Type *</label>
              <select class="form-control" [(ngModel)]="uploadType">
                <option value="INVOICE">INVOICE (Purchase Receipt / Store Invoice)</option>
                <option value="PHOTO">PHOTO (Device Damage Photograph)</option>
                <option value="REPAIR_REPORT">REPAIR_REPORT (Technician Diagnostic)</option>
                <option value="PARTS_INVOICE">PARTS_INVOICE (Replacement Components)</option>
              </select>
            </div>

            <div class="form-group">
              <label>Select File (PDF, PNG, JPG) *</label>
              <input type="file" (change)="onFileSelect($event)" class="form-control" />
            </div>

            <div class="info-note">
              Upon upload, Claimora automatically computes a SHA-256 digital digest for tamper detection and executes OCR field extraction.
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="showUploadModal = false">Cancel</button>
            <button
              class="btn btn-primary"
              [disabled]="uploading || !uploadClaimId || !selectedFile"
              (click)="submitUpload()"
            >
              <span *ngIf="uploading" class="spinner"></span>
              <span>Upload & Ingest</span>
            </button>
          </div>
        </div>
      </div>

      <!-- OCR DATA & MANUAL CORRECTION MODAL -->
      <div class="modal-overlay" *ngIf="selectedDocForOcr">
        <div class="modal-dialog ocr-dialog">
          <div class="modal-header">
            <div>
              <h3>OCR Data & Manual Corrections</h3>
              <span class="subhead">Document #{{ selectedDocForOcr.documentId }} &bull; {{ selectedDocForOcr.originalFilename }}</span>
            </div>
            <button class="modal-close" (click)="selectedDocForOcr = null">&times;</button>
          </div>
          <div class="modal-body">
            <div class="ocr-meta-grid">
              <div>
                <span class="meta-label">Document Type</span>
                <span class="meta-value">{{ selectedDocForOcr.documentType }}</span>
              </div>
              <div>
                <span class="meta-label">Current OCR Status</span>
                <span class="ocr-status" [ngClass]="'ocr-' + selectedDocForOcr.ocrStatus.toLowerCase()">
                  {{ selectedDocForOcr.ocrStatus }}
                </span>
              </div>
              <div>
                <span class="meta-label">SHA-256 Fingerprint</span>
                <code class="hash-code-full">{{ selectedDocForOcr.fileHash }}</code>
              </div>
            </div>

            <div class="form-group">
              <label>Extracted JSON Payload (Fields extracted by OCR / Tess4J / PDFBox):</label>
              <textarea
                class="form-control json-editor"
                rows="8"
                [(ngModel)]="editExtractedDataJson"
                placeholder='{ "invoiceNumber": "INV-1001", "invoiceDate": "2025-01-15", "serialNumber": "SN-12345" }'
              ></textarea>
            </div>

            <div class="form-group" *ngIf="canCorrectOcr">
              <label>Reason for Manual Field Correction *</label>
              <input
                type="text"
                class="form-control"
                [(ngModel)]="correctionReason"
                placeholder="e.g. Corrected misrecognized digit in invoice serial number (O vs 0)"
              />
              <span class="field-hint">Recording a manual correction generates an append-only <code>CORRECT_VALUE</code> audit entry in the investigation trail.</span>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="selectedDocForOcr = null">Cancel</button>
            <button
              class="btn btn-primary"
              *ngIf="canCorrectOcr"
              [disabled]="savingCorrection || !editExtractedDataJson || !correctionReason"
              (click)="saveOcrCorrection()"
            >
              <span *ngIf="savingCorrection" class="spinner"></span>
              <span>Save Correction</span>
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
      color: #38bdf8;
      background: rgba(56, 189, 248, 0.15);
      border: 1px solid rgba(56, 189, 248, 0.3);
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

    .filter-group {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .filter-group label {
      font-size: 0.85rem;
      color: var(--text-muted);
      font-weight: 600;
    }

    .select-claim {
      min-width: 250px;
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
      padding: 0.85rem 1.25rem;
      text-align: left;
      border-bottom: 1px solid var(--border-subtle);
    }

    .data-table th {
      background: #0f172a;
      color: var(--text-muted);
      font-weight: 600;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .data-table tr:hover td {
      background: rgba(255, 255, 255, 0.02);
    }

    .id-dim {
      color: var(--text-dim);
      font-size: 0.8rem;
    }

    .doc-badge {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.2rem 0.55rem;
      border-radius: 4px;
      letter-spacing: 0.04em;
    }

    .doc-badge.invoice {
      background: rgba(59, 130, 246, 0.15);
      color: #93c5fd;
      border: 1px solid rgba(59, 130, 246, 0.3);
    }

    .doc-badge.photo {
      background: rgba(168, 85, 247, 0.15);
      color: #d8b4fe;
      border: 1px solid rgba(168, 85, 247, 0.3);
    }

    .doc-badge.repair_report {
      background: rgba(16, 185, 129, 0.15);
      color: #86efac;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .doc-badge.parts_invoice {
      background: rgba(245, 158, 11, 0.15);
      color: #fde047;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .file-cell {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .file-name {
      font-weight: 500;
      color: var(--text-main);
    }

    .file-meta {
      font-size: 0.75rem;
      color: var(--text-dim);
    }

    .hash-cell {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .hash-code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
      color: #94a3b8;
      background: #0d131f;
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
    }

    .copy-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 0.85rem;
      opacity: 0.6;
      transition: opacity 0.15s ease;
    }

    .copy-btn:hover {
      opacity: 1;
    }

    .claim-ref {
      font-weight: 600;
      color: #60a5fa;
    }

    .ocr-status {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.2rem 0.55rem;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .ocr-status.ocr-processed {
      background: rgba(16, 185, 129, 0.15);
      color: #6ee7b7;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .ocr-status.ocr-manual {
      background: rgba(245, 158, 11, 0.15);
      color: #fde047;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .ocr-status.ocr-failed {
      background: rgba(239, 68, 68, 0.15);
      color: #fca5a5;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .ocr-status.ocr-pending {
      background: rgba(148, 163, 184, 0.15);
      color: #cbd5e1;
      border: 1px solid rgba(148, 163, 184, 0.3);
    }

    .table-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.5rem;
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

    .info-note {
      font-size: 0.8rem;
      color: var(--text-muted);
      background: #0d131f;
      padding: 0.75rem;
      border-radius: var(--radius-sm);
      border-left: 3px solid #3b82f6;
    }

    .ocr-dialog {
      max-width: 750px;
    }

    .subhead {
      font-size: 0.8rem;
      color: var(--text-dim);
    }

    .ocr-meta-grid {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      background: #0d131f;
      padding: 0.85rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-subtle);
    }

    .meta-label {
      font-size: 0.75rem;
      color: var(--text-dim);
      text-transform: uppercase;
      margin-right: 0.5rem;
    }

    .meta-value {
      font-weight: 600;
      color: var(--text-main);
      font-size: 0.85rem;
    }

    .hash-code-full {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
      color: #38bdf8;
      word-break: break-all;
    }

    .json-editor {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.85rem;
      line-height: 1.4;
      background: #090d16;
    }

    .field-hint {
      font-size: 0.75rem;
      color: var(--text-dim);
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
  `]
})
export class EvidenceComponent implements OnInit {
  documents: EvidenceDocument[] = [];
  claims: Claim[] = [];
  selectedClaimFilter: number | null = null;
  searchQuery = '';
  loading = false;

  alertMessage: string | null = null;
  alertType: 'success' | 'danger' = 'success';

  // Upload Modal
  showUploadModal = false;
  uploading = false;
  uploadClaimId = 0;
  uploadType: DocumentType = 'INVOICE';
  selectedFile: File | null = null;

  // OCR Modal
  selectedDocForOcr: EvidenceDocument | null = null;
  editExtractedDataJson = '';
  correctionReason = '';
  savingCorrection = false;

  constructor(
    private evidenceService: EvidenceService,
    private claimService: ClaimService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDocuments();
    this.loadClaimsList();
  }

  get canUpload(): boolean {
    const role = this.authService.currentUser()?.role;
    return role === 'ADMIN' || role === 'STAFF';
  }

  get canCorrectOcr(): boolean {
    const role = this.authService.currentUser()?.role;
    return role === 'ADMIN' || role === 'INVESTIGATOR' || role === 'STAFF';
  }

  loadDocuments(): void {
    this.loading = true;
    this.evidenceService.getDocuments(this.selectedClaimFilter || undefined).subscribe({
      next: (docs) => {
        this.documents = docs;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.cdr.detectChanges();
        this.showAlert(err.error?.message || 'Failed to load evidence documents', 'danger');
      }
    });
  }

  loadClaimsList(): void {
    this.claimService.getClaims({ size: 100 }).subscribe({
      next: (res) => {
        this.claims = res.content;
        this.cdr.detectChanges();
      }
    });
  }

  get filteredDocuments(): EvidenceDocument[] {
    if (!this.searchQuery.trim()) {
      return this.documents;
    }
    const q = this.searchQuery.toLowerCase().trim();
    return this.documents.filter(d =>
      (d.originalFilename && d.originalFilename.toLowerCase().includes(q)) ||
      (d.fileHash && d.fileHash.toLowerCase().includes(q)) ||
      (d.documentType && d.documentType.toLowerCase().includes(q)) ||
      (d.claimNumber && d.claimNumber.toLowerCase().includes(q))
    );
  }

  copyHash(hash: string): void {
    navigator.clipboard.writeText(hash);
    this.showAlert('SHA-256 fingerprint copied to clipboard!', 'success');
  }

  downloadFile(doc: EvidenceDocument): void {
    this.evidenceService.downloadDocumentFile(doc.documentId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.originalFilename || `evidence_${doc.documentId}`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.showAlert(err.error?.message || 'Failed to download file', 'danger');
      }
    });
  }

  openUploadModal(): void {
    this.uploadClaimId = this.claims.length > 0 ? this.claims[0].claimId : 0;
    this.uploadType = 'INVOICE';
    this.selectedFile = null;
    this.showUploadModal = true;
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  submitUpload(): void {
    if (!this.uploadClaimId || !this.selectedFile) return;

    this.uploading = true;
    this.claimService.uploadDocument(this.uploadClaimId, this.selectedFile, this.uploadType).subscribe({
      next: (created) => {
        this.uploading = false;
        this.showUploadModal = false;
        this.showAlert(`Evidence document #${created.documentId} uploaded successfully!`, 'success');
        this.loadDocuments();
      },
      error: (err) => {
        this.uploading = false;
        this.showAlert(err.error?.message || 'Upload failed', 'danger');
      }
    });
  }

  openOcrModal(doc: EvidenceDocument): void {
    this.selectedDocForOcr = doc;
    this.editExtractedDataJson = doc.extractedData || '{}';
    this.correctionReason = '';
  }

  saveOcrCorrection(): void {
    if (!this.selectedDocForOcr || !this.editExtractedDataJson || !this.correctionReason) return;

    // Validate JSON format
    try {
      JSON.parse(this.editExtractedDataJson);
    } catch {
      this.showAlert('Invalid JSON format in extracted data field', 'danger');
      return;
    }

    this.savingCorrection = true;
    const req: UpdateExtractedDataRequest = {
      extractedData: this.editExtractedDataJson,
      reason: this.correctionReason
    };

    this.evidenceService.updateExtractedData(this.selectedDocForOcr.documentId, req).subscribe({
      next: (updated) => {
        this.savingCorrection = false;
        this.selectedDocForOcr = null;
        this.showAlert(`Document #${updated.documentId} OCR data manually corrected and audit action recorded!`, 'success');
        this.loadDocuments();
      },
      error: (err) => {
        this.savingCorrection = false;
        this.showAlert(err.error?.message || 'Correction failed', 'danger');
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
