export type ServiceRequestStatus =
  | 'Pending'
  | 'Payment Required'
  | 'Payment Verified'
  | 'Downpayment Required'
  | 'Downpayment Verified, Payment Completion Required'
  | 'Approved'
  | 'Completed'
  | 'Rejected'
  | 'Cancelled';

export interface ServiceRequest {
  id: string;
  serviceId: string;
  serviceName: string;
  homeownerId: string;
  homeownerName: string;
  status: ServiceRequestStatus;
  amount: number;
  downPaymentAmount: number | null;
  ratesSubtotal: number | null;
  serviceChargeAmount: number | null;
  bookingStartDate: string | null;
  bookingEndDate: string | null;
  bookingStartTime: string | null;
  bookingEndTime: string | null;
  bookingDays: number | null;
  notes: string;
  remarks: string | null;
  requestedAt: string;
  updatedAt: string;
  pendingPaymentId: string | null;
}

export interface CreateServiceRequestPayload {
  notes: string;
  bookingStartDate?: string;
  bookingEndDate?: string;
  bookingStartTime?: string;
  bookingEndTime?: string;
}
