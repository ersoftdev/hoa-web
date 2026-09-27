export type ServiceStatus = 'Draft' | 'Published' | 'Active' | 'Inactive' | 'Archived';

export interface ServiceRate {
  id: string;
  label: string;
  amount: number;
}

export type RecurrenceFrequency = 'Monthly' | 'Weekly' | 'Yearly';

export interface ServiceSchedule {
  isRecurring: boolean;
  recurrenceFrequency: RecurrenceFrequency | null;
  autoNotifyHomeowners: boolean;
  fromDate: string | null;
  endDate: string | null;
  is24Hours: boolean;
  startTime: string | null;
  endTime: string | null;
  isBookingService: boolean;
}

export interface ServicePaymentRequirement {
  paymentRequired: boolean;
  downpaymentRequired: boolean;
  downPaymentPercent: number | null;
  requireApprovalBeforePayment: boolean;
}

export interface BoardApproval {
  required: boolean;
  approvedCount: number;
  requiredCount: number;
  approvedByMe: boolean;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  status: ServiceStatus;
  rates: ServiceRate[];
  schedule: ServiceSchedule;
  requirements: string[];
  capacity: number | null;
  payment: ServicePaymentRequirement;
  serviceCharge: number | null;
  icon: string | null;
  boardApproval: BoardApproval;
  createdAt: string;
}

export interface UpsertServiceRequest {
  name: string;
  description: string;
  schedule: ServiceSchedule;
  capacity: number | null;
  payment: ServicePaymentRequirement;
  serviceCharge: number | null;
  icon: string | null;
  rates: Array<{ label: string; amount: number }>;
  requirements: string[];
}

export type ServiceLifecycleAction = 'publish' | 'activate' | 'deactivate' | 'archive';
