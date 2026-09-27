import { ContentStatus, Visibility } from './content-visibility.model';

export interface EventBooking {
  serviceRequestId: string;
  serviceRequestStatus: string;
  serviceId: string;
  serviceName: string;
  serviceIcon: string | null;
  bookingStartDate: string;
  bookingEndDate: string;
  bookingStartTime: string | null;
  bookingEndTime: string | null;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  startsAt: string;
  endsAt: string | null;
  location: string;
  status: ContentStatus;
  visibility: Visibility;
  createdAt: string;
  booking: EventBooking | null;
}

export interface UpsertEventRequest {
  title: string;
  description: string;
  location: string;
  visibility: Visibility;
  serviceId: string | null;
  bookingStartDate: string;
  bookingEndDate: string;
  bookingStartTime: string | null;
  bookingEndTime: string | null;
}
