import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';

import { ApiError } from '../../../../core/http/api-error.model';
import { CalendarBookingEntry } from '../../../../shared/components/hoa-calendar/calendar-booking-entry.model';
import { HoaCalendarComponent } from '../../../../shared/components/hoa-calendar/hoa-calendar.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { CalendarApiService } from '../../data-access/calendar-api.service';
import { CalendarBooking } from '../../models/calendar-booking.model';

function toEntry(booking: CalendarBooking): CalendarBookingEntry {
  return {
    id: booking.id,
    serviceId: booking.serviceId,
    serviceName: booking.serviceName,
    serviceIcon: booking.serviceIcon,
    homeownerName: booking.homeownerName,
    status: booking.status,
    bookingStartDate: booking.bookingStartDate,
    bookingEndDate: booking.bookingEndDate,
    bookingStartTime: booking.bookingStartTime,
    bookingEndTime: booking.bookingEndTime,
  };
}

@Component({
  selector: 'app-calendar',
  imports: [PageHeaderComponent, HoaCalendarComponent, DatePipe],
  templateUrl: './calendar.component.html',
})
export class CalendarComponent {
  private readonly api = inject(CalendarApiService);

  protected readonly bookings = signal<CalendarBookingEntry[]>([]);
  protected readonly loadError = signal<string | null>(null);
  protected readonly selectedDay = signal<{ date: string; bookings: CalendarBookingEntry[] } | null>(null);

  protected onMonthChanged(range: { from: string; to: string }): void {
    this.loadError.set(null);
    this.api.listBookings(range.from, range.to).subscribe({
      next: (result) => this.bookings.set(result.map(toEntry)),
      error: (error: ApiError) => this.loadError.set(error.message),
    });
  }

  protected onDaySelected(selection: { date: string; bookings: CalendarBookingEntry[] }): void {
    this.selectedDay.set(selection);
  }
}
