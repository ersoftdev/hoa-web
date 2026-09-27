import { createFeature, createReducer, createSelector, on } from '@ngrx/store';

import { Permission, permissionsForRoles } from '../../auth/models/permission.model';
import { AuthActions } from './auth.actions';
import { AuthState, initialAuthState } from './auth.state';

const reducer = createReducer(
  initialAuthState,

  on(AuthActions.loginRequested, (state): AuthState => ({ ...state, status: 'authenticating', error: null })),
  on(
    AuthActions.loginSuccess,
    (state, { session }): AuthState => ({
      ...state,
      status: 'authenticated',
      user: session.user,
      roles: session.user.roles,
      permissions: [...permissionsForRoles(session.user.roles)],
      error: null,
    }),
  ),
  on(AuthActions.loginFailure, (state, { error }): AuthState => ({ ...state, status: 'unauthenticated', error })),

  on(AuthActions.refreshRequested, (state): AuthState => ({
    ...state,
    status: state.status === 'idle' ? 'authenticating' : state.status,
    error: null,
  })),
  on(
    AuthActions.refreshSuccess,
    (state, { session }): AuthState => ({
      ...state,
      status: 'authenticated',
      user: session.user,
      roles: session.user.roles,
      permissions: [...permissionsForRoles(session.user.roles)],
      error: null,
    }),
  ),
  on(AuthActions.refreshFailure, (): AuthState => ({ ...initialAuthState, status: 'unauthenticated' })),

  on(AuthActions.logoutCompleted, (): AuthState => ({ ...initialAuthState, status: 'unauthenticated' })),

  on(
    AuthActions.demoSessionStarted,
    (state, { user }): AuthState => ({
      ...state,
      status: 'authenticated',
      user,
      roles: user.roles,
      permissions: [...permissionsForRoles(user.roles)],
      error: null,
    }),
  ),
);

export const authFeature = createFeature({
  name: 'auth',
  reducer,
  extraSelectors: ({ selectUser, selectPermissions }) => ({
    selectIsAuthenticated: createSelector(selectUser, (user) => user !== null),
    selectPermissionSet: createSelector(selectPermissions, (permissions) => new Set(permissions)),
  }),
});

export const selectHasPermission = (permission: Permission) =>
  createSelector(authFeature.selectPermissionSet, (permissions) => permissions.has(permission));
