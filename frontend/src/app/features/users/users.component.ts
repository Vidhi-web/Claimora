import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User, Role, UserStatus, Page, AdminCreateUserRequest, UpdateUserRequest } from '../../models/user.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="users-container">
      <header class="page-header">
        <div>
          <h2>User Administration</h2>
          <p class="subtitle">Provision corporate accounts, configure role authorization, and manage lifecycle status.</p>
        </div>
        <button type="button" class="btn-primary" (click)="openCreateModal()">
          <span>+ Create New User</span>
        </button>
      </header>

      <!-- Alert Banners -->
      <div *ngIf="successMessage()" class="alert-success">
        <span>✓ {{ successMessage() }}</span>
      </div>
      <div *ngIf="errorMessage()" class="alert-error">
        <span>⚠️ {{ errorMessage() }}</span>
      </div>

      <!-- Search & Filters Toolbar -->
      <div class="toolbar">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange()"
            placeholder="Search by name or email..."
          />
          <button *ngIf="searchQuery" class="clear-btn" (click)="clearSearch()">&times;</button>
        </div>

        <div class="pagination-info">
          <span>Showing page {{ currentPage() + 1 }} of {{ totalPages() || 1 }} ({{ totalElements() }} users)</span>
        </div>
      </div>

      <!-- Users Table -->
      <div class="table-card">
        <div *ngIf="isLoading()" class="loading-overlay">
          <div class="spinner"></div>
          <span>Loading user accounts...</span>
        </div>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let u of users()">
              <td>{{ u.userId }}</td>
              <td><strong>{{ u.name }}</strong></td>
              <td>{{ u.email }}</td>
              <td>
                <span class="badge" [ngClass]="u.role.toLowerCase()">{{ u.role }}</span>
              </td>
              <td>
                <span class="status-badge" [ngClass]="u.status.toLowerCase()">{{ u.status }}</span>
              </td>
              <td>{{ u.createdAt ? (u.createdAt | date:'shortDate') : '-' }}</td>
              <td class="actions-cell">
                <button type="button" class="btn-action edit" (click)="openEditModal(u)">Edit</button>
                <button type="button" class="btn-action role" (click)="openRoleModal(u)">Role</button>
                <button
                  type="button"
                  class="btn-action"
                  [ngClass]="u.status === 'ACTIVE' ? 'deactivate' : 'activate'"
                  (click)="toggleStatus(u)"
                >
                  {{ u.status === 'ACTIVE' ? 'Deactivate' : 'Activate' }}
                </button>
              </td>
            </tr>
            <tr *ngIf="users().length === 0 && !isLoading()">
              <td colspan="7" class="empty-state">No user accounts found matching your query.</td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination Controls -->
        <div class="pagination-footer">
          <button
            type="button"
            class="btn-page"
            [disabled]="currentPage() === 0 || isLoading()"
            (click)="goToPage(currentPage() - 1)"
          >
            &larr; Previous
          </button>
          <span class="page-indicator">Page {{ currentPage() + 1 }} / {{ totalPages() || 1 }}</span>
          <button
            type="button"
            class="btn-page"
            [disabled]="currentPage() >= totalPages() - 1 || isLoading()"
            (click)="goToPage(currentPage() + 1)"
          >
            Next &rarr;
          </button>
        </div>
      </div>

      <!-- CREATE USER MODAL -->
      <div *ngIf="showCreateModal()" class="modal-backdrop">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Create New User Account</h3>
            <button class="modal-close" (click)="showCreateModal.set(false)">&times;</button>
          </div>
          <form (ngSubmit)="onCreateSubmit()">
            <div class="modal-body">
              <div class="form-group">
                <label for="create-name">Full Name *</label>
                <input id="create-name" type="text" [(ngModel)]="createForm.name" name="name" required placeholder="Jane Doe" />
              </div>
              <div class="form-group">
                <label for="create-email">Corporate Email *</label>
                <input id="create-email" type="email" [(ngModel)]="createForm.email" name="email" required placeholder="jane.doe@claimora.internal" />
              </div>
              <div class="form-group">
                <label for="create-password">Initial Password * (min 8 chars, letter + number)</label>
                <input id="create-password" type="password" [(ngModel)]="createForm.password" name="password" required placeholder="••••••••••••" />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="create-role">Assigned Role</label>
                  <select id="create-role" [(ngModel)]="createForm.role" name="role">
                    <option value="STAFF">STAFF</option>
                    <option value="INVESTIGATOR">INVESTIGATOR</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="create-status">Initial Status</label>
                  <select id="create-status" [(ngModel)]="createForm.status" name="status">
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-cancel" (click)="showCreateModal.set(false)">Cancel</button>
              <button type="submit" class="btn-primary" [disabled]="isSubmitting()">
                {{ isSubmitting() ? 'Creating...' : 'Create Account' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- EDIT USER MODAL -->
      <div *ngIf="showEditModal()" class="modal-backdrop">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Edit User Details</h3>
            <button class="modal-close" (click)="showEditModal.set(false)">&times;</button>
          </div>
          <form (ngSubmit)="onEditSubmit()">
            <div class="modal-body">
              <div class="form-group">
                <label for="edit-name">Full Name</label>
                <input id="edit-name" type="text" [(ngModel)]="editForm.name" name="name" required />
              </div>
              <div class="form-group">
                <label for="edit-email">Email Address</label>
                <input id="edit-email" type="email" [(ngModel)]="editForm.email" name="email" required />
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-cancel" (click)="showEditModal.set(false)">Cancel</button>
              <button type="submit" class="btn-primary" [disabled]="isSubmitting()">
                {{ isSubmitting() ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- CHANGE ROLE MODAL -->
      <div *ngIf="showRoleModal()" class="modal-backdrop">
        <div class="modal-card small">
          <div class="modal-header">
            <h3>Change User Role</h3>
            <button class="modal-close" (click)="showRoleModal.set(false)">&times;</button>
          </div>
          <form (ngSubmit)="onRoleSubmit()">
            <div class="modal-body">
              <p class="role-user-tag">User: <strong>{{ selectedUser()?.name }}</strong> ({{ selectedUser()?.email }})</p>
              <div class="form-group">
                <label for="select-role">Select New Role</label>
                <select id="select-role" [(ngModel)]="newRole" name="role">
                  <option value="ADMIN">ADMIN (Full System Access)</option>
                  <option value="INVESTIGATOR">INVESTIGATOR (Analyze & Resolve)</option>
                  <option value="STAFF">STAFF (Claims & Evidence Intake)</option>
                </select>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-cancel" (click)="showRoleModal.set(false)">Cancel</button>
              <button type="submit" class="btn-primary" [disabled]="isSubmitting()">
                {{ isSubmitting() ? 'Updating...' : 'Apply Role' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .users-container { padding: 1.5rem 0; color: #f3f4f6; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; gap: 1rem; }
    .page-header h2 { margin: 0 0 0.25rem; font-size: 1.5rem; color: #f9fafb; }
    .subtitle { margin: 0; color: #9ca3af; font-size: 0.9rem; }
    .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; gap: 1rem; flex-wrap: wrap; }
    .search-box { display: flex; align-items: center; background: #111827; border: 1px solid #1f2937; border-radius: 6px; padding: 0.4rem 0.75rem; width: 320px; }
    .search-icon { margin-right: 0.5rem; font-size: 0.85rem; }
    .search-box input { background: transparent; border: none; color: #f3f4f6; outline: none; width: 100%; font-size: 0.875rem; }
    .clear-btn { background: none; border: none; color: #9ca3af; cursor: pointer; font-size: 1rem; padding: 0; }
    .pagination-info { font-size: 0.85rem; color: #9ca3af; }
    .table-card { background: #111827; border: 1px solid #1f2937; border-radius: 8px; overflow: hidden; position: relative; }
    .loading-overlay { position: absolute; inset: 0; background: rgba(17, 24, 39, 0.75); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 10; gap: 0.5rem; color: #9ca3af; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid #1f2937; font-size: 0.875rem; }
    th { background: #1f2937; color: #9ca3af; font-weight: 600; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; }
    .badge { padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700; }
    .badge.admin { background: #7c2d12; color: #fdba74; }
    .badge.investigator { background: #312e81; color: #c7d2fe; }
    .badge.staff { background: #064e3b; color: #6ee7b7; }
    .status-badge { padding: 0.2rem 0.5rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
    .status-badge.active { background: rgba(16, 185, 129, 0.2); color: #34d399; }
    .status-badge.inactive { background: rgba(107, 114, 128, 0.2); color: #9ca3af; }
    .actions-cell { display: flex; gap: 0.4rem; }
    .btn-action { padding: 0.25rem 0.5rem; font-size: 0.75rem; border-radius: 4px; border: 1px solid #374151; background: #1f2937; color: #d1d5db; cursor: pointer; }
    .btn-action:hover { background: #374151; color: #ffffff; }
    .btn-action.deactivate { color: #f87171; border-color: rgba(239, 68, 68, 0.4); }
    .btn-action.activate { color: #34d399; border-color: rgba(16, 185, 129, 0.4); }
    .empty-state { text-align: center; color: #9ca3af; padding: 2rem 1rem; }
    .pagination-footer { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; background: #1f2937; font-size: 0.85rem; }
    .btn-page { background: #111827; border: 1px solid #374151; color: #d1d5db; padding: 0.35rem 0.75rem; border-radius: 4px; cursor: pointer; }
    .btn-page:hover:not(:disabled) { background: #374151; color: #ffffff; }
    .btn-page:disabled { opacity: 0.4; cursor: not-allowed; }
    .alert-success { background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; color: #6ee7b7; padding: 0.75rem 1rem; border-radius: 6px; margin-bottom: 1rem; font-size: 0.875rem; }
    .alert-error { background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; color: #fca5a5; padding: 0.75rem 1rem; border-radius: 6px; margin-bottom: 1rem; font-size: 0.875rem; }
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.7); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 1rem; }
    .modal-card { background: #111827; border: 1px solid #1f2937; border-radius: 10px; width: 100%; max-width: 520px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7); }
    .modal-card.small { max-width: 420px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid #1f2937; }
    .modal-header h3 { margin: 0; font-size: 1.15rem; color: #f9fafb; }
    .modal-close { background: none; border: none; font-size: 1.5rem; color: #9ca3af; cursor: pointer; }
    .modal-body { padding: 1.25rem 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1rem 1.5rem; border-top: 1px solid #1f2937; background: #0f172a; border-radius: 0 0 10px 10px; }
    .form-group { display: flex; flex-direction: column; gap: 0.35rem; }
    .form-group label { font-size: 0.8rem; color: #d1d5db; font-weight: 500; }
    .form-group input, .form-group select { padding: 0.65rem 0.75rem; background: #1f2937; border: 1px solid #374151; border-radius: 6px; color: #f9fafb; font-size: 0.9rem; }
    .form-group input:focus, .form-group select:focus { outline: none; border-color: #3b82f6; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .btn-primary { background: #2563eb; color: #ffffff; border: none; padding: 0.65rem 1.15rem; border-radius: 6px; font-weight: 600; cursor: pointer; }
    .btn-primary:hover:not(:disabled) { background: #1d4ed8; }
    .btn-cancel { background: #1f2937; color: #d1d5db; border: 1px solid #374151; padding: 0.65rem 1.15rem; border-radius: 6px; cursor: pointer; }
    .btn-cancel:hover { background: #374151; }
    .role-user-tag { font-size: 0.85rem; color: #9ca3af; margin: 0; }
    .role-user-tag strong { color: #f3f4f6; }
    .spinner { width: 24px; height: 24px; border: 3px solid rgba(255, 255, 255, 0.2); border-top-color: #3b82f6; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class UsersComponent implements OnInit {
  users = signal<User[]>([]);
  currentPage = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);
  isLoading = signal(false);
  isSubmitting = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  searchQuery = '';
  private searchDebounceTimer?: number;

  showCreateModal = signal(false);
  showEditModal = signal(false);
  showRoleModal = signal(false);
  selectedUser = signal<User | null>(null);

  createForm: AdminCreateUserRequest = {
    name: '',
    email: '',
    password: '',
    role: 'STAFF',
    status: 'ACTIVE'
  };

  editForm: UpdateUserRequest = {
    name: '',
    email: ''
  };

  newRole: Role = 'STAFF';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(page = 0): void {
    this.isLoading.set(true);
    this.userService.getUsers(this.searchQuery, page, 10).subscribe({
      next: (pageData: Page<User>) => {
        this.users.set(pageData.content);
        this.currentPage.set(pageData.number);
        this.totalPages.set(pageData.totalPages);
        this.totalElements.set(pageData.totalElements);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to load user directory');
      }
    });
  }

  onSearchChange(): void {
    if (this.searchDebounceTimer) {
      window.clearTimeout(this.searchDebounceTimer);
    }
    this.searchDebounceTimer = window.setTimeout(() => {
      this.loadUsers(0);
    }, 300);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.loadUsers(0);
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages()) {
      this.loadUsers(page);
    }
  }

  openCreateModal(): void {
    this.createForm = {
      name: '',
      email: '',
      password: '',
      role: 'STAFF',
      status: 'ACTIVE'
    };
    this.showCreateModal.set(true);
  }

  onCreateSubmit(): void {
    this.isSubmitting.set(true);
    this.userService.createUser(this.createForm).subscribe({
      next: (created: User) => {
        this.isSubmitting.set(false);
        this.showCreateModal.set(false);
        this.notifySuccess(`User '${created.name}' created successfully with role ${created.role}`);
        this.loadUsers(0);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to create user');
      }
    });
  }

  openEditModal(user: User): void {
    this.selectedUser.set(user);
    this.editForm = {
      name: user.name,
      email: user.email
    };
    this.showEditModal.set(true);
  }

  onEditSubmit(): void {
    const user = this.selectedUser();
    if (!user) return;

    this.isSubmitting.set(true);
    this.userService.updateUser(user.userId, this.editForm).subscribe({
      next: (updated: User) => {
        this.isSubmitting.set(false);
        this.showEditModal.set(false);
        this.notifySuccess(`User '${updated.name}' updated successfully`);
        this.loadUsers(this.currentPage());
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to update user');
      }
    });
  }

  openRoleModal(user: User): void {
    this.selectedUser.set(user);
    this.newRole = user.role;
    this.showRoleModal.set(true);
  }

  onRoleSubmit(): void {
    const user = this.selectedUser();
    if (!user) return;

    this.isSubmitting.set(true);
    this.userService.updateRole(user.userId, this.newRole).subscribe({
      next: (updated: User) => {
        this.isSubmitting.set(false);
        this.showRoleModal.set(false);
        this.notifySuccess(`Role for '${updated.name}' updated to ${updated.role}`);
        this.loadUsers(this.currentPage());
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to update role');
      }
    });
  }

  toggleStatus(user: User): void {
    const nextStatus: UserStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    this.userService.updateStatus(user.userId, nextStatus).subscribe({
      next: (updated: User) => {
        this.notifySuccess(`User '${updated.name}' is now ${updated.status}`);
        this.loadUsers(this.currentPage());
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to change user status');
      }
    });
  }

  private notifySuccess(msg: string): void {
    this.successMessage.set(msg);
    window.setTimeout(() => this.successMessage.set(null), 4000);
  }
}
