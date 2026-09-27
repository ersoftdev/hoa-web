import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';

import { AuthService } from '../auth/auth.service';
import { TokenStorageService } from '../auth/token-storage.service';

const SKIP_REFRESH_PATTERNS = [
  '/login',
  '/register',
  '/refresh',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/resend-verification',
];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStorage = inject(TokenStorageService);
  const authService = inject(AuthService);
  const router = inject(Router);

  const withAuthHeader = (token: string | null) =>
    token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(withAuthHeader(tokenStorage.current)).pipe(
    catchError((error: unknown) => {
      const isUnauthorized = error instanceof HttpErrorResponse && error.status === 401;
      const isAuthEndpoint = SKIP_REFRESH_PATTERNS.some((pattern) => req.url.includes(pattern));

      if (!isUnauthorized || isAuthEndpoint) {
        return throwError(() => error);
      }

      return authService.refresh().pipe(
        switchMap((refreshed) => {
          if (!refreshed) {
            void router.navigate(['/login']);
            return throwError(() => error);
          }
          return next(withAuthHeader(tokenStorage.current));
        }),
      );
    }),
  );
};
