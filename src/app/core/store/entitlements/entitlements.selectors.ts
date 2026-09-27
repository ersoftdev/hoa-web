import { entitlementsFeature, selectIsFeatureEnabled } from './entitlements.reducer';

export const {
  selectEntitlementsState,
  selectEnabledFeatureKeys,
  selectStatus: selectEntitlementsStatus,
  selectError: selectEntitlementsError,
  selectEnabledFeatureKeySet,
} = entitlementsFeature;

export { selectIsFeatureEnabled };
