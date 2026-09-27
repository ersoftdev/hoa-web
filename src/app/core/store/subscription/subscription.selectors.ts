import { selectHasFeature, subscriptionFeature } from './subscription.reducer';

export const {
  selectSubscriptionState,
  selectPlan,
  selectStatus: selectSubscriptionStatus,
  selectTrialEndsAt,
  selectActiveUsers,
  selectMaxActiveUsers,
  selectFeatures,
  selectInitStatus: selectSubscriptionInitStatus,
  selectError: selectSubscriptionError,
  selectIsOnActiveTrial,
} = subscriptionFeature;

export { selectHasFeature };
