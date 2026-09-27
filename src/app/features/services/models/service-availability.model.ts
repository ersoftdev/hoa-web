export interface BusySlot {
  bookingStartDate: string; // yyyy-MM-dd
  bookingEndDate: string;
  bookingStartTime: string | null;
  bookingEndTime: string | null;
}

export interface ServiceAvailability {
  serviceId: string;
  isBookingService: boolean;
  slots: BusySlot[];
}
