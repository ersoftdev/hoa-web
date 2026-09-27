import { AuthActions } from '../auth/auth.actions';
import { EntitlementsActions } from './entitlements.actions';
import { entitlementsFeature, selectIsFeatureEnabled } from './entitlements.reducer';
import { EntitlementsState, initialEntitlementsState } from './entitlements.state';

function rootState(entitlements: EntitlementsState) {
  return { entitlements };
}

describe('entitlements.reducer', () => {
  it('starts idle with nothing enabled', () => {
    expect(initialEntitlementsState).toEqual<EntitlementsState>({
      enabledFeatureKeys: [],
      status: 'idle',
      error: null,
    });
  });

  it('entitlementsRequested moves to loading', () => {
    const state = entitlementsFeature.reducer(initialEntitlementsState, EntitlementsActions.entitlementsRequested());
    expect(state.status).toBe('loading');
  });

  it('entitlementsSuccess populates the enabled feature keys and moves to ready', () => {
    const state = entitlementsFeature.reducer(
      initialEntitlementsState,
      EntitlementsActions.entitlementsSuccess({ enabledFeatureKeys: ['calendar-bookings'] }),
    );
    expect(state).toEqual<EntitlementsState>({
      enabledFeatureKeys: ['calendar-bookings'],
      status: 'ready',
      error: null,
    });
  });

  it('entitlementsFailure records the error', () => {
    const state = entitlementsFeature.reducer(
      initialEntitlementsState,
      EntitlementsActions.entitlementsFailure({ error: 'boom' }),
    );
    expect(state.status).toBe('error');
    expect(state.error).toBe('boom');
  });

  it('entitlementsCleared and logoutCompleted both reset to the initial state', () => {
    const ready: EntitlementsState = { enabledFeatureKeys: ['calendar-bookings'], status: 'ready', error: null };
    expect(entitlementsFeature.reducer(ready, EntitlementsActions.entitlementsCleared())).toEqual(
      initialEntitlementsState,
    );
    expect(entitlementsFeature.reducer(ready, AuthActions.logoutCompleted())).toEqual(initialEntitlementsState);
  });

  it('selectIsFeatureEnabled(key) is a parameterized selector', () => {
    const state: EntitlementsState = { enabledFeatureKeys: ['calendar-bookings'], status: 'ready', error: null };
    expect(selectIsFeatureEnabled('calendar-bookings')(rootState(state))).toBe(true);
    expect(selectIsFeatureEnabled('payments-online')(rootState(state))).toBe(false);
  });
});
