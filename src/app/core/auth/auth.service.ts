import { Injectable, inject } from '@angular/core';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable, map, of, switchMap, take, throwError } from 'rxjs';

import { HoaApiService } from '../api/hoa-api.service';
import { IdentityApiService } from '../api/identity-api.service';
import { AuthActions } from '../store/auth/auth.actions';
import { authFeature } from '../store/auth/auth.reducer';
import { tenantFeature } from '../store/tenant/tenant.reducer';
import { AuthUser, LoginCredentials, RegisterRequest, ResetPasswordRequest, VerifyEmailRequest } from './models/auth-user.model';
import { Permission, Role } from './models/permission.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly store = inject(Store);
  private readonly actions$ = inject(Actions);
  private readonly identityApi = inject(IdentityApiService);
  private readonly hoaApi = inject(HoaApiService);

  readonly currentUser = this.store.selectSignal(authFeature.selectUser);
  readonly isAuthenticated = this.store.selectSignal(authFeature.selectIsAuthenticated);
  private readonly permissionSet = this.store.selectSignal(authFeature.selectPermissionSet);

  hasPermission(permission: Permission): boolean {
    return this.permissionSet().has(permission);
  }

  login(credentials: LoginCredentials): Observable<AuthUser> {
    this.store.dispatch(AuthActions.loginRequested({ credentials }));
    return this.actions$.pipe(
      ofType(AuthActions.loginSuccess, AuthActions.loginFailure),
      take(1),
      switchMap((action) =>
        action.type === AuthActions.loginFailure.type
          ? throwError(() => action.error)
          : of(action.session.user),
      ),
    );
  }

  register(payload: RegisterRequest): Observable<void> {
    const associationId = this.store.selectSignal(tenantFeature.selectAssociationId)();
    return this.hoaApi.post<void>('/homeowners/register', { ...payload, associationId });
  }

  requestPasswordReset(email: string): Observable<void> {
    return this.identityApi.post<void>('/forgot-password', { email });
  }

  resetPassword(payload: ResetPasswordRequest): Observable<void> {
    return this.identityApi.post<void>('/reset-password', payload);
  }

  verifyEmail(payload: VerifyEmailRequest): Observable<void> {
    return this.identityApi.post<void>('/verify-email', payload);
  }

  resendVerificationEmail(email: string): Observable<void> {
    return this.identityApi.post<void>('/resend-verification', { email });
  }

  signInAsDemoUser(role: Role): void {
    this.store.dispatch(AuthActions.demoSessionRequested({ role }));
  }

  logout(): Observable<void> {
    this.store.dispatch(AuthActions.logoutRequested());
    return this.actions$.pipe(
      ofType(AuthActions.logoutCompleted),
      take(1),
      map(() => undefined),
    );
  }

  refresh(): Observable<boolean> {
    this.store.dispatch(AuthActions.refreshRequested());
    return this.actions$.pipe(
      ofType(AuthActions.refreshSuccess, AuthActions.refreshFailure),
      take(1),
      map((action) => action.type === AuthActions.refreshSuccess.type),
    );
  }
}
