import { createActionGroup, emptyProps, props } from '@ngrx/store';

import { SubscriptionFeature, PlanCode, SubscriptionStatus } from './subscription.state';

export interface SubscriptionResponse {
  plan: PlanCode;
  status: SubscriptionStatus;
  trialEndsAt: string | null;
  activeUsers: number;
  maxActiveUsers: number | null;
  features: SubscriptionFeature[];
}

export const SubscriptionActions = createActionGroup({
  source: 'Subscription',
  events: {
    'Subscription Requested': emptyProps(),
    'Subscription Success': props<{ subscription: SubscriptionResponse }>(),
    'Subscription Failure': props<{ error: string }>(),
    'Subscription Cleared': emptyProps(),
  },
});
