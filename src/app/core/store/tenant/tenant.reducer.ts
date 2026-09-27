import { createFeature, createReducer, on } from '@ngrx/store';

import { AuthActions } from '../auth/auth.actions';
import { TenantActions } from './tenant.actions';
import { initialTenantState, TenantState } from './tenant.state';

const reducer = createReducer(
  initialTenantState,

  on(TenantActions.tenantInitRequested, (state): TenantState => ({ ...state, status: 'loading', error: null })),
  on(
    TenantActions.tenantInitSuccess,
    (state, { associationId, associationName, associationSlug }): TenantState => ({
      ...state,
      associationId,
      associationName,
      associationSlug,
      status: 'ready',
      error: null,
    }),
  ),
  on(TenantActions.tenantInitFailure, (state, { error }): TenantState => ({ ...state, status: 'error', error })),
  on(TenantActions.tenantCleared, (): TenantState => initialTenantState),

  on(AuthActions.logoutCompleted, (): TenantState => initialTenantState),
);

export const tenantFeature = createFeature({
  name: 'tenant',
  reducer,
});
