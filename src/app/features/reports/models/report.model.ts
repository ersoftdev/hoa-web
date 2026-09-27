export type ReportCategory = 'User' | 'Sales';

export interface ReportTypeSummary {
  id: string;
  code: string;
  name: string;
  description: string;
  category: ReportCategory;
  adminOnly: boolean;
  lastGeneratedAt: string | null;
}

export interface HomeownersReportRow {
  id: string;
  fullName: string;
  email: string;
  address: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface BoardMemberReportRow {
  id: string;
  hoaYear: number;
  homeownerId: string;
  homeownerName: string;
  position: string;
  homeownerStatus: 'Active' | 'Inactive';
}

export type ServiceRequestReportStatus =
  | 'Pending'
  | 'Payment Required'
  | 'Payment Verified'
  | 'Downpayment Required'
  | 'Downpayment Verified, Payment Completion Required'
  | 'Approved'
  | 'Completed'
  | 'Rejected'
  | 'Cancelled';

export interface ServiceRequestReportRow {
  id: string;
  homeownerId: string;
  homeownerName: string;
  serviceId: string;
  serviceName: string;
  status: ServiceRequestReportStatus;
  amount: number;
  requestedAt: string;
}

export type PaymentFulfillment = 'Fulfilled' | 'Downpayment Only — Balance Due';

export interface ServicePaymentReportRow {
  id: string;
  homeownerId: string;
  homeownerName: string;
  serviceRequestId: string;
  serviceName: string;
  isDownpayment: boolean;
  amount: number;
  method: 'Online' | 'Cash';
  provider: 'GCash' | 'Bank Transfer' | null;
  submittedAt: string;
  fulfillment: PaymentFulfillment;
}

export interface UserActivityReportRow {
  id: string;
  occurredAt: string;
  actorName: string;
  category: string;
  description: string;
}
