import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'auth',
    loadComponent: () => import('./features/auth/auth.component').then(m => m.AuthComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'users',
    loadComponent: () => import('./features/users/users.component').then(m => m.UsersComponent)
  },
  {
    path: 'products',
    loadComponent: () => import('./features/products/products.component').then(m => m.ProductsComponent)
  },
  {
    path: 'claims',
    loadComponent: () => import('./features/claims/claims.component').then(m => m.ClaimsComponent)
  },
  {
    path: 'evidence',
    loadComponent: () => import('./features/evidence/evidence.component').then(m => m.EvidenceComponent)
  },
  {
    path: 'findings',
    loadComponent: () => import('./features/findings/findings.component').then(m => m.FindingsComponent)
  },
  {
    path: 'investigations',
    loadComponent: () => import('./features/investigations/investigations.component').then(m => m.InvestigationsComponent)
  },
  {
    path: 'reports',
    loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent)
  },
  { path: '**', redirectTo: 'dashboard' }
];
