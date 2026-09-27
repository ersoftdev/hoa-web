export type PaymentStatus = 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Cancelled';

export type PaymentMethod = 'Online' | 'Cash';
export type OnlinePaymentProvider = 'GCash' | 'Bank Transfer';

export interface Payment {
  id: string;
  homeownerId: string;
  homeownerName: string;
  serviceRequestId: string;
  serviceName: string;
  isDownpayment: boolean;
  amount: number;
  method: PaymentMethod;
  provider: OnlinePaymentProvider | null;
  reference: string | null;
  screenshotUrl: string | null;
  accountReference: string | null;
  notes: string | null;
  status: PaymentStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
  adminNotes: string | null;
  submittedAt: string;
}

export interface SubmitPaymentPayload {
  serviceRequestId: string;
  isDownpayment: boolean;
  amount: number;
  method: PaymentMethod;
  provider: OnlinePaymentProvider | null;
  reference: string | null;
  screenshotUrl: string | null;
  accountReference: string | null;
  notes: string | null;
}

export interface PayableItem {
  serviceRequestId: string;
  serviceName: string;
  isDownpayment: boolean;
  amountDue: number;
}
