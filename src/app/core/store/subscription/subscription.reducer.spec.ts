import { AuthActions } from '../auth/auth.actions';
import { SubscriptionActions, SubscriptionResponse } from './subscription.actions';
import { selectHasFeature, subscriptionFeature } from './subscription.reducer';
import { initialSubscriptionState, SubscriptionState } from './subscription.state';

function rootState(subscription: SubscriptionState) {
  return { subscription };
}

const subscriptionResponse: SubscriptionResponse = {
  plan: 'FREE_TRIAL',
  status: 'TRIAL',
  trialEndsAt: '2026-12-01T00:00:00.000Z',
  activeUsers: 3,
  maxActiveUsers: null,
  features: [
    { key: 'HOMEOWNERS', name: 'Homeowners', enabled: true },
    { key: 'GAMIFICATION', name: 'Gamification', enabled: false },
  ],
};

describe('subscription.reducer', () => {
  it('starts idle with nothing loaded', () => {
    expect(initialSubscriptionState).toEqual<SubscriptionState>({
      plan: null,
      status: null,
      trialEndsAt: null,
      activeUsers: null,
      maxActiveUsers: null,
      features: [],
      initStatus: 'idle',
      error: null,
    });
  });

  it('subscriptionRequested moves to loading', () => {
    const state = subscriptionFeature.reducer(
      initialSubscriptionState,
      SubscriptionActions.subscriptionRequested(),
    );
    expect(state.initStatus).toBe('loading');
  });

  it('subscriptionSuccess populates the response fields and moves to ready', () => {
    const state = subscriptionFeature.reducer(
      initialSubscriptionState,
      SubscriptionActions.subscriptionSuccess({ subscription: subscriptionResponse }),
    );
    expect(state).toEqual<SubscriptionState>({ ...subscriptionResponse, initStatus: 'ready', error: null });
  });

  it('subscriptionFailure records the error', () => {
    const state = subscriptionFeature.reducer(
      initialSubscriptionState,
      SubscriptionActions.subscriptionFailure({ error: 'boom' }),
    );
    expect(state.initStatus).toBe('error');
    expect(state.error).toBe('boom');
  });

  it('subscriptionCleared and logoutCompleted both reset to the initial state', () => {
    const ready = subscriptionFeature.reducer(
      initialSubscriptionState,
      SubscriptionActions.subscriptionSuccess({ subscription: subscriptionResponse }),
    );
    expect(subscriptionFeature.reducer(ready, SubscriptionActions.subscriptionCleared())).toEqual(
      initialSubscriptionState,
    );
    expect(subscriptionFeature.reducer(ready, AuthActions.logoutCompleted())).toEqual(initialSubscriptionState);
  });

  it('selectHasFeature(key) reads the enabled flag off the stored features array', () => {
    const state: SubscriptionState = { ...subscriptionResponse, initStatus: 'ready', error: null };
    expect(selectHasFeature('HOMEOWNERS')(rootState(state))).toBe(true);
    expect(selectHasFeature('GAMIFICATION')(rootState(state))).toBe(false);
    expect(selectHasFeature('NOT_A_REAL_FEATURE')(rootState(state))).toBe(false);
  });
});
