import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Role } from '../../models/user.model';

/**
 * Route guard enforcing role-based permissions based on route.data['roles'].
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/auth/login']);
  }

  const allowedRoles = (route.data?.['roles'] || []) as Role[];

  if (allowedRoles.length === 0 || authService.hasRole(allowedRoles)) {
    return true;
  }

  // User lacks permission for this route, redirect to default dashboard
  return router.createUrlTree(['/dashboard']);
};
