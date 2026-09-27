export interface CalendarBookingEntry {
  id: string;
  serviceId: string;
  serviceName?: string;
  serviceIcon?: string | null;
  homeownerName?: string;
  status?: string;
  bookingStartDate: string; // yyyy-MM-dd
  bookingEndDate: string;
  bookingStartTime: string | null;
  bookingEndTime: string | null;
}
