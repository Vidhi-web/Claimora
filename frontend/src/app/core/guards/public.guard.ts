import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

/**
 * Guard for public routes (landing, login).
 * If the user is already authenticated, redirect them to /dashboard.
 */
export const publicGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router      = inject(Router);
  if (authService.isAuthenticated()) {
    return router.createUrlTree(['/dashboard']);
  }
  return true;
};