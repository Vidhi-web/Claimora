import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/auth.component').then(m => m.AuthComponent)
  },
  {
    path: 'auth',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'products',
    canActivate: [authGuard],
    loadComponent: () => import('./features/products/products.component').then(m => m.ProductsComponent)
  },
  {
    path: 'claims',
    canActivate: [authGuard],
    loadComponent: () => import('./features/claims/claims.component').then(m => m.ClaimsComponent)
  },
  {
    path: 'evidence',
    canActivate: [authGuard],
    loadComponent: () => import('./features/evidence/evidence.component').then(m => m.EvidenceComponent)
  },
  {
    path: 'findings',
    canActivate: [authGuard],
    loadComponent: () => import('./features/findings/findings.component').then(m => m.FindingsComponent)
  },
  {
    path: 'investigations',
    canActivate: [authGuard],
    loadComponent: () => import('./features/investigations/investigations.component').then(m => m.InvestigationsComponent)
  },
  {
    path: 'reports',
    canActivate: [authGuard],
    loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent)
  },
  {
    path: 'users',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () => import('./features/users/users.component').then(m => m.UsersComponent)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
  },
  { path: '**', redirectTo: 'dashboard' }
];
