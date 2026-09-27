export type NotificationType =
  | 'EventPosted'
  | 'AnnouncementPosted'
  | 'OperationYearChanged'
  | 'ServiceRequestSubmitted'
  | 'RecurringServiceCreated'
  | 'PaymentSubmitted'
  | 'ServiceRequestApproved'
  | 'ServiceRequestRejected'
  | 'PaymentApproved'
  | 'PaymentRejected';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  entityType: string;
  entityId: string | null;
  read: boolean;
  createdAt: string;
}
