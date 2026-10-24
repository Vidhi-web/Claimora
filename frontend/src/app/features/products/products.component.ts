import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../core/auth/auth.service';
import { Product, CreateProductRequest, UpdateProductRequest } from '../../models/product.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <!-- Page Header -->
      <header class="page-header">
        <div>
          <div class="badge-tag">Registry &amp; Assets</div>
          <h1>Covered Products &amp; Warranty Registry</h1>
          <p class="subtitle">Search product serial numbers, verify active warranty windows, and register new assets.</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-primary" (click)="openCreateModal()" *ngIf="canManageProducts">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Register Product
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
            placeholder="Search by serial number or model name..."
            [(ngModel)]="searchQuery"
            (keyup.enter)="loadProducts()"
          />
        </div>
        <button class="btn btn-secondary btn-sm" (click)="loadProducts()">
          Search
        </button>
      </div>

      <!-- Alert Message -->
      <div *ngIf="alertMessage" class="alert-banner" [ngClass]="alertType">
        <span>{{ alertMessage }}</span>
        <button (click)="alertMessage = null" class="close-alert">&times;</button>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <span>Loading product registry...</span>
      </div>

      <!-- Products Table -->
      <div *ngIf="!loading" class="claimora-card table-card">
        <table class="data-table" *ngIf="products.length > 0; else noProducts">
          <thead>
            <tr>
              <th>ID</th>
              <th>Serial Number</th>
              <th>Model Name</th>
              <th>Purchase Date</th>
              <th>Warranty Coverage</th>
              <th>Warranty Status</th>
              <th *ngIf="canManageProducts">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of products">
              <td>
                <span class="id-dim">#{{ p.productId }}</span>
              </td>
              <td>
                <code class="serial-badge">{{ p.serialNumber }}</code>
              </td>
              <td>
                <span class="model-name">{{ p.model }}</span>
              </td>
              <td>
                <span class="date-text">{{ p.purchaseDate | date:'mediumDate' }}</span>
              </td>
              <td>
                <span class="window-text">
                  {{ p.warrantyStart | date:'shortDate' }} &rarr; {{ p.warrantyEnd | date:'shortDate' }}
                </span>
              </td>
              <td>
                <span
                  class="pill"
                  [ngClass]="isWarrantyActive(p.warrantyEnd) ? 'pill-resolved' : 'pill-dismissed'"
                >
                  {{ isWarrantyActive(p.warrantyEnd) ? 'ACTIVE' : 'EXPIRED' }}
                </span>
              </td>
              <td *ngIf="canManageProducts">
                <button class="btn-icon btn-edit" (click)="openEditModal(p)" title="Edit product">
                  <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z">
                    </path>
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <ng-template #noProducts>
          <div class="empty-state">
            <div class="empty-icon">📦</div>
            <h3>No Products Found</h3>
            <p>No registered products match the search query.</p>
            <button class="btn btn-secondary btn-sm" (click)="resetSearch()">Reset Search</button>
          </div>
        </ng-template>

        <!-- Pagination Footer -->
        <div class="pagination-footer" *ngIf="totalPages > 1">
          <span class="pagination-info">Showing page {{ currentPage + 1 }} of {{ totalPages }} ({{ totalElements }} products)</span>
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

      <!-- CREATE PRODUCT MODAL -->
      <div class="modal-overlay" *ngIf="showCreateModal">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3>Register Product in Catalog</h3>
            <button class="modal-close" (click)="showCreateModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Model Name *</label>
              <input
                type="text"
                class="form-control"
                [(ngModel)]="newProduct.model"
                placeholder="e.g. Dell XPS 15 9530"
              />
            </div>

            <div class="form-group">
              <label>Serial Number *</label>
              <input
                type="text"
                class="form-control"
                [(ngModel)]="newProduct.serialNumber"
                placeholder="e.g. SN-XPS15-9530-9921"
              />
            </div>

            <div class="form-group">
              <label>Purchase Date *</label>
              <input
                type="date"
                class="form-control"
                [(ngModel)]="newProduct.purchaseDate"
                (change)="onPurchaseDateChange()"
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Warranty Start *</label>
                <input
                  type="date"
                  class="form-control"
                  [(ngModel)]="newProduct.warrantyStart"
                />
              </div>
              <div class="form-group">
                <label>Warranty End *</label>
                <input
                  type="date"
                  class="form-control"
                  [(ngModel)]="newProduct.warrantyEnd"
                />
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="showCreateModal = false">Cancel</button>
            <button
              class="btn btn-primary"
              [disabled]="submitting || !newProduct.model || !newProduct.serialNumber || !newProduct.purchaseDate || !newProduct.warrantyStart || !newProduct.warrantyEnd"
              (click)="submitProduct()"
            >
              <span *ngIf="submitting" class="spinner"></span>
              <span>Register Product</span>
            </button>
          </div>
        </div>
      </div>

      <!-- EDIT PRODUCT MODAL -->
      <div class="modal-overlay" *ngIf="showEditModal">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3>Edit Product</h3>
            <button class="modal-close" (click)="closeEditModal()">&times;</button>
          </div>
          <div class="modal-body">
            <div class="edit-info-banner">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>If this product has associated claims, its serial number cannot be changed.</span>
            </div>

            <div class="form-group">
              <label>Model Name *</label>
              <input
                type="text"
                class="form-control"
                [(ngModel)]="editProduct.model"
                placeholder="e.g. Dell XPS 15 9530"
              />
            </div>

            <div class="form-group">
              <label>Serial Number *</label>
              <input
                type="text"
                class="form-control"
                [(ngModel)]="editProduct.serialNumber"
                placeholder="e.g. SN-XPS15-9530-9921"
              />
            </div>

            <div class="form-group">
              <label>Purchase Date *</label>
              <input
                type="date"
                class="form-control"
                [(ngModel)]="editProduct.purchaseDate"
                (change)="onEditPurchaseDateChange()"
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Warranty Start *</label>
                <input
                  type="date"
                  class="form-control"
                  [(ngModel)]="editProduct.warrantyStart"
                />
              </div>
              <div class="form-group">
                <label>Warranty End *</label>
                <input
                  type="date"
                  class="form-control"
                  [(ngModel)]="editProduct.warrantyEnd"
                />
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeEditModal()">Cancel</button>
            <button
              class="btn btn-primary"
              [disabled]="submitting || !editProduct.model || !editProduct.serialNumber || !editProduct.purchaseDate || !editProduct.warrantyStart || !editProduct.warrantyEnd"
              (click)="submitEditProduct()"
            >
              <span *ngIf="submitting" class="spinner"></span>
              <span>Save Changes</span>
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
      color: #7c3aed;
      background: #ede9fe;
      border: 1px solid #c4b5fd;
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
      max-width: 500px;
    }

    .search-box input {
      background: transparent;
      border: none;
      color: var(--text-main);
      font-size: 0.9rem;
      width: 100%;
      outline: none;
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
      background: var(--bg-elevated);
      color: var(--text-dim);
      font-weight: 600;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .data-table tr:hover td {
      background: var(--bg-elevated);
    }

    .id-dim {
      color: var(--text-dim);
      font-size: 0.8rem;
    }

    .serial-badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
      color: #1d4ed8;
      background: #dbeafe;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      border: 1px solid #bfdbfe;
    }

    .model-name {
      font-weight: 600;
      color: var(--text-main);
    }

    .date-text, .window-text {
      color: var(--text-muted);
      font-size: 0.825rem;
    }

    .btn-icon {
      background: transparent;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 0.3rem 0.5rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s, border-color 0.15s;
    }

    .btn-edit {
      color: #7c3aed;
    }

    .btn-edit:hover {
      background: #ede9fe;
      border-color: #c4b5fd;
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
      padding: 0.85rem 1.25rem;
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

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .edit-info-banner {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.65rem 0.9rem;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: var(--radius-sm);
      color: #1d4ed8;
      font-size: 0.8rem;
      margin-bottom: 1rem;
    }
  `]
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  totalElements = 0;
  totalPages = 0;
  currentPage = 0;
  pageSize = 10;
  searchQuery = '';

  loading = false;
  alertMessage: string | null = null;
  alertType: 'success' | 'danger' = 'success';

  // Create modal state
  showCreateModal = false;
  submitting = false;
  newProduct: CreateProductRequest = {
    model: '',
    serialNumber: '',
    purchaseDate: new Date().toISOString().substring(0, 10),
    warrantyStart: new Date().toISOString().substring(0, 10),
    warrantyEnd: new Date(Date.now() + 2 * 365 * 24 * 3600 * 1000).toISOString().substring(0, 10)
  };

  // Edit modal state
  showEditModal = false;
  editingProductId: number | null = null;
  editProduct: UpdateProductRequest = {
    model: '',
    serialNumber: '',
    purchaseDate: '',
    warrantyStart: '',
    warrantyEnd: ''
  };

  constructor(
    private productService: ProductService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  get canManageProducts(): boolean {
    const role = this.authService.currentUser()?.role;
    return role === 'ADMIN' || role === 'STAFF';
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getProducts(this.searchQuery, this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        this.products = res.content;
        this.totalElements = res.totalElements;
        this.totalPages = res.totalPages;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.showAlert(err.error?.message || 'Failed to load products', 'danger');
      }
    });
  }

  resetSearch(): void {
    this.searchQuery = '';
    this.currentPage = 0;
    this.loadProducts();
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadProducts();
  }

  /**
   * Checks if a warranty is still active.
   * Uses explicit UTC noon parsing ('T12:00:00Z') to avoid timezone off-by-one errors
   * where 'YYYY-MM-DD' strings parsed as local midnight can resolve to the previous
   * calendar day in timezones behind UTC (e.g. IST is UTC+5:30, not behind UTC,
   * but the fix is correct practice for all environments and ensures consistency).
   */
  isWarrantyActive(warrantyEnd: string): boolean {
    if (!warrantyEnd) return false;
    const end = new Date(warrantyEnd + 'T12:00:00Z');
    return end.getTime() >= Date.now();
  }

  // ─── Create Modal ──────────────────────────────────────────────────────────

  openCreateModal(): void {
    const today = new Date().toISOString().substring(0, 10);
    const twoYearsLater = new Date(Date.now() + 2 * 365 * 24 * 3600 * 1000).toISOString().substring(0, 10);
    this.newProduct = {
      model: '',
      serialNumber: '',
      purchaseDate: today,
      warrantyStart: today,
      warrantyEnd: twoYearsLater
    };
    this.showCreateModal = true;
  }

  onPurchaseDateChange(): void {
    if (this.newProduct.purchaseDate) {
      this.newProduct.warrantyStart = this.newProduct.purchaseDate;
      const purchaseTime = new Date(this.newProduct.purchaseDate + 'T12:00:00Z').getTime();
      const twoYears = 2 * 365 * 24 * 3600 * 1000;
      this.newProduct.warrantyEnd = new Date(purchaseTime + twoYears).toISOString().substring(0, 10);
    }
  }

  submitProduct(): void {
    if (!this.newProduct.model || !this.newProduct.serialNumber || !this.newProduct.purchaseDate) {
      return;
    }
    this.submitting = true;
    this.productService.createProduct(this.newProduct).subscribe({
      next: (created) => {
        this.submitting = false;
        this.showCreateModal = false;
        this.showAlert(`Product "${created.model}" registered successfully!`, 'success');
        this.loadProducts();
      },
      error: (err) => {
        this.submitting = false;
        this.showAlert(err.error?.message || 'Failed to register product', 'danger');
      }
    });
  }

  // ─── Edit Modal ────────────────────────────────────────────────────────────

  openEditModal(product: Product): void {
    this.editingProductId = product.productId;
    this.editProduct = {
      model: product.model,
      serialNumber: product.serialNumber,
      purchaseDate: product.purchaseDate,
      warrantyStart: product.warrantyStart,
      warrantyEnd: product.warrantyEnd
    };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingProductId = null;
  }

  onEditPurchaseDateChange(): void {
    if (this.editProduct.purchaseDate) {
      // Sync warrantyStart to purchaseDate only if it's earlier (avoids overwriting valid start dates)
      if (!this.editProduct.warrantyStart || this.editProduct.warrantyStart < this.editProduct.purchaseDate) {
        this.editProduct.warrantyStart = this.editProduct.purchaseDate;
      }
    }
  }

  submitEditProduct(): void {
    if (!this.editingProductId || !this.editProduct.model || !this.editProduct.serialNumber) {
      return;
    }
    this.submitting = true;
    this.productService.updateProduct(this.editingProductId, this.editProduct).subscribe({
      next: (updated) => {
        this.submitting = false;
        this.showEditModal = false;
        this.editingProductId = null;
        this.showAlert(`Product "${updated.model}" updated successfully!`, 'success');
        this.loadProducts();
      },
      error: (err) => {
        this.submitting = false;
        this.showAlert(err.error?.message || 'Failed to update product', 'danger');
      }
    });
  }

  // ─── Utilities ─────────────────────────────────────────────────────────────

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
