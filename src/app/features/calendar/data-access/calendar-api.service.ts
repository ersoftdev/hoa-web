import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { HoaApiService } from '../../../core/api/hoa-api.service';
import { CalendarBooking } from '../models/calendar-booking.model';

@Injectable({ providedIn: 'root' })
export class CalendarApiService {
  private readonly hoaApi = inject(HoaApiService);

  listBookings(from: string, to: string): Observable<CalendarBooking[]> {
    return this.hoaApi.get<CalendarBooking[]>('/services/calendar', { from, to });
  }
}
