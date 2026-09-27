import { AuthActions } from '../auth/auth.actions';
import { TenantActions } from './tenant.actions';
import { tenantFeature } from './tenant.reducer';
import { initialTenantState, TenantState } from './tenant.state';

describe('tenant.reducer', () => {
  it('starts idle with no association', () => {
    expect(initialTenantState).toEqual<TenantState>({
      associationId: null,
      associationName: null,
      associationSlug: null,
      status: 'idle',
      error: null,
    });
  });

  it('tenantInitRequested moves to loading', () => {
    const state = tenantFeature.reducer(initialTenantState, TenantActions.tenantInitRequested());
    expect(state.status).toBe('loading');
  });

  it('tenantInitSuccess populates the association and moves to ready', () => {
    const state = tenantFeature.reducer(
      initialTenantState,
      TenantActions.tenantInitSuccess({
        associationId: 'assoc-1',
        associationName: 'Maple Grove HOA',
        associationSlug: 'maple-grove',
      }),
    );
    expect(state).toEqual<TenantState>({
      associationId: 'assoc-1',
      associationName: 'Maple Grove HOA',
      associationSlug: 'maple-grove',
      status: 'ready',
      error: null,
    });
  });

  it('tenantInitFailure records the error', () => {
    const state = tenantFeature.reducer(initialTenantState, TenantActions.tenantInitFailure({ error: 'boom' }));
    expect(state.status).toBe('error');
    expect(state.error).toBe('boom');
  });

  it('tenantCleared and logoutCompleted both reset to the initial state', () => {
    const ready: TenantState = {
      associationId: 'assoc-1',
      associationName: 'Maple Grove HOA',
      associationSlug: 'maple-grove',
      status: 'ready',
      error: null,
    };
    expect(tenantFeature.reducer(ready, TenantActions.tenantCleared())).toEqual(initialTenantState);
    expect(tenantFeature.reducer(ready, AuthActions.logoutCompleted())).toEqual(initialTenantState);
  });
});
