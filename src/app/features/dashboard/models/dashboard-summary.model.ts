import { ActivityLogEntry } from '../../activities/models/activity.model';

export interface DashboardTiles {
  totalUsers: number | null;
  finances: number;
  completedOrFulfilledServiceRequests: number | null;
  totalServiceRequests: number | null;
  completedPayments: number;
  downpaymentCompletionRequired: number;
}

export interface FinancialOverviewPoint {
  date: string;
  amount: number;
}

export type PaymentTypeLabel = 'GCash' | 'Bank Transfer' | 'Cash';

export interface PaymentTypeBreakdown {
  label: PaymentTypeLabel;
  count: number;
  totalAmount: number;
}

export interface ServiceRequestBreakdown {
  serviceName: string;
  count: number;
}

export type DashboardRange = '7d' | '30d' | '90d' | '1y';

export interface DashboardSummary {
  tiles: DashboardTiles;
  financialOverview: FinancialOverviewPoint[];
  recentActivity: ActivityLogEntry[];
  paymentTypeBreakdown: PaymentTypeBreakdown[];
  serviceRequestBreakdown: ServiceRequestBreakdown[];
  recurringServiceRequestBreakdown: ServiceRequestBreakdown[];
  recurringServicePaymentBreakdown: PaymentTypeBreakdown[];
}
