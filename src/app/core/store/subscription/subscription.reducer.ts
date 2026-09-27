import { createFeature, createReducer, createSelector, on } from '@ngrx/store';

import { AuthActions } from '../auth/auth.actions';
import { SubscriptionActions } from './subscription.actions';
import { initialSubscriptionState, SubscriptionState } from './subscription.state';

const reducer = createReducer(
  initialSubscriptionState,

  on(
    SubscriptionActions.subscriptionRequested,
    (state): SubscriptionState => ({ ...state, initStatus: 'loading', error: null }),
  ),
  on(
    SubscriptionActions.subscriptionSuccess,
    (state, { subscription }): SubscriptionState => ({
      ...state,
      ...subscription,
      initStatus: 'ready',
      error: null,
    }),
  ),
  on(
    SubscriptionActions.subscriptionFailure,
    (state, { error }): SubscriptionState => ({ ...state, initStatus: 'error', error }),
  ),
  on(SubscriptionActions.subscriptionCleared, (): SubscriptionState => initialSubscriptionState),

  on(AuthActions.logoutCompleted, (): SubscriptionState => initialSubscriptionState),
);

export const subscriptionFeature = createFeature({
  name: 'subscription',
  reducer,
  extraSelectors: ({ selectStatus, selectTrialEndsAt }) => ({
    selectIsOnActiveTrial: createSelector(
      selectStatus,
      selectTrialEndsAt,
      (status, trialEndsAt) => status === 'TRIAL' && !!trialEndsAt && new Date(trialEndsAt) > new Date(),
    ),
  }),
});

export const selectHasFeature = (featureKey: string) =>
  createSelector(
    subscriptionFeature.selectFeatures,
    (features) => features.find((f) => f.key === featureKey)?.enabled ?? false,
  );
