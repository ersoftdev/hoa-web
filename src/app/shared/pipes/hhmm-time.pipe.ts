import { Pipe, PipeTransform } from '@angular/core';
import dayjs from 'dayjs';

/** Raw "HH:mm" (24-hour, e.g. Service.schedule.startTime/endTime or a
 * booking's bookingStartTime/EndTime) → "h:mm A" (e.g. "9:30 AM") — the
 * "1970-01-01T" + value trick this app already uses ad hoc with DatePipe
 * (see service-request-form's Schedule Availability block), pulled out
 * into one reusable pipe now that the Calendar page needs the same
 * conversion for its per-booking time range. */
@Pipe({ name: 'hhmmTime' })
export class HhmmTimePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    return dayjs(`1970-01-01T${value}`).format('h:mm A');
  }
}
