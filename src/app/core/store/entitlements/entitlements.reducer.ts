import { createFeature, createReducer, createSelector, on } from '@ngrx/store';

import { AuthActions } from '../auth/auth.actions';
import { EntitlementsActions } from './entitlements.actions';
import { EntitlementsState, initialEntitlementsState } from './entitlements.state';

const reducer = createReducer(
  initialEntitlementsState,

  on(
    EntitlementsActions.entitlementsRequested,
    (state): EntitlementsState => ({ ...state, status: 'loading', error: null }),
  ),
  on(
    EntitlementsActions.entitlementsSuccess,
    (state, { enabledFeatureKeys }): EntitlementsState => ({
      ...state,
      enabledFeatureKeys,
      status: 'ready',
      error: null,
    }),
  ),
  on(
    EntitlementsActions.entitlementsFailure,
    (state, { error }): EntitlementsState => ({ ...state, status: 'error', error }),
  ),
  on(EntitlementsActions.entitlementsCleared, (): EntitlementsState => initialEntitlementsState),

  on(AuthActions.logoutCompleted, (): EntitlementsState => initialEntitlementsState),
);

export const entitlementsFeature = createFeature({
  name: 'entitlements',
  reducer,
  extraSelectors: ({ selectEnabledFeatureKeys }) => ({
    selectEnabledFeatureKeySet: createSelector(selectEnabledFeatureKeys, (keys) => new Set(keys)),
  }),
});

export const selectIsFeatureEnabled = (featureKey: string) =>
  createSelector(entitlementsFeature.selectEnabledFeatureKeySet, (keys) => keys.has(featureKey));
