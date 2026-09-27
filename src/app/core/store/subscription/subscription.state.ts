export type SubscriptionInitStatus = 'idle' | 'loading' | 'ready' | 'error';

export type PlanCode = 'FREE_TRIAL' | 'FREE' | 'PREMIUM';
export type SubscriptionStatus = 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'CANCELLED';

export interface SubscriptionFeature {
  key: string;
  name: string;
  enabled: boolean;
}

export interface SubscriptionState {
  plan: PlanCode | null;
  status: SubscriptionStatus | null;
  trialEndsAt: string | null;
  activeUsers: number | null;
  maxActiveUsers: number | null;
  features: SubscriptionFeature[];
  initStatus: SubscriptionInitStatus;
  error: string | null;
}

export const initialSubscriptionState: SubscriptionState = {
  plan: null,
  status: null,
  trialEndsAt: null,
  activeUsers: null,
  maxActiveUsers: null,
  features: [],
  initStatus: 'idle',
  error: null,
};
