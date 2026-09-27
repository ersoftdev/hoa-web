import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, exhaustMap, map, of, tap, withLatestFrom } from 'rxjs';

import { IdentityApiService } from '../../api/identity-api.service';
import { AuthSession, AuthUser } from '../../auth/models/auth-user.model';
import { Role } from '../../auth/models/permission.model';
import { TokenStorageService } from '../../auth/token-storage.service';
import { ApiError, isApiError, unknownApiError } from '../../http/api-error.model';
import { NotificationsService } from '../../notifications/notifications.service';
import { tenantFeature } from '../tenant/tenant.reducer';
import { AuthActions } from './auth.actions';

const DEMO_USERS_BY_ROLE: Record<Role, AuthUser> = {
  Homeowner: { id: 'demo-homeowner', email: 'homeowner@example.com', fullName: 'Jamie Cruz', roles: ['Homeowner'] },
  BoardMember: { id: 'demo-board-member', email: 'board@example.com', fullName: 'Alex Santos', roles: ['BoardMember'] },
  Admin: { id: 'demo-admin', email: 'admin@example.com', fullName: 'Robin Reyes', roles: ['Admin'] },
};

function encodeDevToken(user: AuthUser): string {
  const payload = { sub: user.id, email: user.email, fullName: user.fullName, roles: user.roles };
  return btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function toApiError(error: unknown): ApiError {
  return isApiError(error) ? error : unknownApiError();
}

export const loginEffect = createEffect(
  (
    actions$ = inject(Actions),
    identityApi = inject(IdentityApiService),
    tokenStorage = inject(TokenStorageService),
    notifications = inject(NotificationsService),
    store = inject(Store),
  ) =>
    actions$.pipe(
      ofType(AuthActions.loginRequested),
      withLatestFrom(store.select(tenantFeature.selectAssociationId)),
      exhaustMap(([{ credentials }, associationId]) =>
        identityApi.post<AuthSession>('/login', { ...credentials, associationId }).pipe(
          tap((session) => {
            tokenStorage.set(session.tokens.accessToken);
            notifications.connect();
          }),
          map((session) => AuthActions.loginSuccess({ session })),
          catchError((error: unknown) => of(AuthActions.loginFailure({ error: toApiError(error) }))),
        ),
      ),
    ),
  { functional: true },
);

export const refreshEffect = createEffect(
  (actions$ = inject(Actions), identityApi = inject(IdentityApiService), tokenStorage = inject(TokenStorageService), notifications = inject(NotificationsService)) =>
    actions$.pipe(
      ofType(AuthActions.refreshRequested),
      exhaustMap(() =>
        identityApi.post<AuthSession>('/refresh', {}).pipe(
          tap((session) => {
            tokenStorage.set(session.tokens.accessToken);
            notifications.connect();
          }),
          map((session) => AuthActions.refreshSuccess({ session })),
          catchError(() => {
            tokenStorage.clear();
            notifications.disconnect();
            return of(AuthActions.refreshFailure());
          }),
        ),
      ),
    ),
  { functional: true },
);

export const logoutEffect = createEffect(
  (actions$ = inject(Actions), identityApi = inject(IdentityApiService), tokenStorage = inject(TokenStorageService), notifications = inject(NotificationsService)) =>
    actions$.pipe(
      ofType(AuthActions.logoutRequested),
      exhaustMap(() =>
        identityApi.post<void>('/logout', {}).pipe(
          catchError(() => of(undefined)),
          tap(() => {
            tokenStorage.clear();
            notifications.disconnect();
          }),
          map(() => AuthActions.logoutCompleted()),
        ),
      ),
    ),
  { functional: true },
);

export const demoSessionEffect = createEffect(
  (actions$ = inject(Actions), tokenStorage = inject(TokenStorageService), notifications = inject(NotificationsService)) =>
    actions$.pipe(
      ofType(AuthActions.demoSessionRequested),
      map(({ role }) => {
        const user = DEMO_USERS_BY_ROLE[role];
        tokenStorage.set(encodeDevToken(user));
        notifications.connect();
        return AuthActions.demoSessionStarted({ user });
      }),
    ),
  { functional: true },
);

export const authEffects = {
  loginEffect,
  refreshEffect,
  logoutEffect,
  demoSessionEffect,
};
