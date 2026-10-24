import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, delay, retry, throwError, timer } from 'rxjs';
import { AuthService } from '../auth/auth.service';

/**
 * Functional HTTP Interceptor:
 * 1. Attaches the Bearer token to all /api requests.
 * 2. Auto-retries 0, 502, 503, 504 errors twice with a 2-second delay
 *    (handles Supabase/backend cold-start latency).
 * 3. On 401 Unauthorized: clears session and redirects to login.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  // Attach token for API calls
  const authReq = token && req.url.startsWith('/api')
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    // Retry up to 2 times for transient errors (backend cold start / Supabase latency)
    retry({
      count: 2,
      delay: (error: HttpErrorResponse, attempt) => {
        const retryable = error.status === 0    // network error / ECONNREFUSED
                       || error.status === 502  // bad gateway (proxy timeout)
                       || error.status === 503  // service unavailable
                       || error.status === 504; // gateway timeout
        if (!retryable) {
          // Don't retry auth errors or client errors
          throw error;
        }
        // Wait 2s before retry 1, 4s before retry 2
        return timer(attempt * 2000);
      }
    }),
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized: clear session and redirect to login
      if (error.status === 401 && !req.url.includes('/api/auth/login')) {
        authService.logout();
        router.navigate(['/auth/login'], {
          queryParams: { sessionExpired: 'true' }
        });
      }
      return throwError(() => error);
    })
  );
};
