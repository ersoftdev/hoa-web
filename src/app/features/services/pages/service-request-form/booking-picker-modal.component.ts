import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, computed, inject, output, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Modal } from 'bootstrap';
import dayjs from 'dayjs';

import { ApiError } from '../../../../core/http/api-error.model';
import { CalendarBookingEntry } from '../../../../shared/components/hoa-calendar/calendar-booking-entry.model';
import { HoaCalendarComponent } from '../../../../shared/components/hoa-calendar/hoa-calendar.component';
import { HhmmTimePipe } from '../../../../shared/pipes/hhmm-time.pipe';
import { ServicesApiService } from '../../data-access/services-api.service';
import { Service } from '../../models/service.model';

export interface BookingSelection {
  bookingStartDate: string;
  bookingEndDate: string;
  bookingStartTime: string;
  bookingEndTime: string;
}

export interface TimeOption {
  value: string; // "HH:mm"
  label: string; // "9:30 AM"
  disabled?: boolean;
  reason?: 'booked' | 'unavailable';
}

interface BookedTimeRange {
  start: string; // "HH:mm"
  end: string; // "HH:mm"
}

const TIME_OPTION_STEP_MINUTES = 30;

const MIN_BOOKING_DURATION_MINUTES = 30;

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function buildTimeOptions(start: string, end: string): TimeOption[] {
  const startMinutes = toMinutes(start);
  const endMinutes = toMinutes(end);

  const options: TimeOption[] = [];
  for (let minutes = startMinutes; minutes <= endMinutes; minutes += TIME_OPTION_STEP_MINUTES) {
    const value = `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
    options.push({ value, label: dayjs(`1970-01-01T${value}`).format('h:mm A') });
  }
  return options;
}

const NO_SERVICE_SCHEDULE = { is24Hours: false, startTime: '00:00', endTime: '23:30' };

@Component({
  selector: 'app-booking-picker-modal',
  imports: [FormsModule, DatePipe, HoaCalendarComponent, HhmmTimePipe],
  templateUrl: './booking-picker-modal.component.html',
})
export class BookingPickerModalComponent implements AfterViewInit, OnDestroy {
  private readonly api = inject(ServicesApiService);
  private readonly modalElement = viewChild.required<ElementRef<HTMLElement>>('modalRef');

  private modal?: Modal;

  protected readonly isOpen = signal(false);
  protected readonly service = signal<Service | null>(null);
  protected readonly busySlots = signal<CalendarBookingEntry[]>([]);
  protected readonly loadError = signal<string | null>(null);
  protected readonly selectedRange = signal<{ start: string; end: string } | null>(null);
  protected readonly startTime = signal('');
  protected readonly endTime = signal('');

  protected readonly effectiveSchedule = computed(() => {
    const service = this.service();
    return service ? service.schedule : NO_SERVICE_SCHEDULE;
  });

  protected readonly bookedTimeRanges = computed<BookedTimeRange[]>(() => {
    const range = this.selectedRange();
    if (!range) return [];
    return this.busySlots()
      .filter((slot) => slot.bookingStartDate <= range.end && slot.bookingEndDate >= range.start)
      .filter((slot) => !!slot.bookingStartTime && !!slot.bookingEndTime)
      .map((slot) => ({ start: slot.bookingStartTime!, end: slot.bookingEndTime! }));
  });

  protected readonly startTimeOptions = computed<TimeOption[]>(() => {
    const schedule = this.effectiveSchedule();
    if (schedule.is24Hours || !schedule.startTime || !schedule.endTime) return [];
    const booked = this.bookedTimeRanges();
    const closeMinutes = toMinutes(schedule.endTime);
    return buildTimeOptions(schedule.startTime, schedule.endTime).map((option) => {
      const isBooked = booked.some((r) => option.value >= r.start && option.value < r.end);
      const tooLateForMinDuration = toMinutes(option.value) + MIN_BOOKING_DURATION_MINUTES > closeMinutes;
      return {
        ...option,
        disabled: isBooked || tooLateForMinDuration,
        reason: isBooked ? 'booked' : tooLateForMinDuration ? 'unavailable' : undefined,
      };
    });
  });

  protected readonly endTimeOptions = computed<TimeOption[]>(() => {
    const start = this.startTime();
    const booked = this.bookedTimeRanges();
    return this.startTimeOptions()
      .filter((option) => !start || toMinutes(option.value) - toMinutes(start) >= MIN_BOOKING_DURATION_MINUTES)
      .map((option) => {
        const bookedDirect = booked.some((r) => option.value >= r.start && option.value <= r.end);
        const disabled = !!start && booked.some((r) => start < r.start && option.value > r.start);
        return { ...option, disabled, reason: !disabled ? undefined : bookedDirect ? 'booked' : 'unavailable' };
      });
  });

  protected readonly canConfirm = computed(() => {
    const range = this.selectedRange();
    if (!range) return false;
    if (!this.effectiveSchedule().is24Hours) {
      const start = this.startTime();
      const end = this.endTime();
      if (!start || !end) return false;
      if (this.startTimeOptions().find((o) => o.value === start)?.disabled) return false;
      if (this.endTimeOptions().find((o) => o.value === end)?.disabled) return false;
    }
    return true;
  });

  readonly confirmed = output<BookingSelection>();

  ngAfterViewInit(): void {
    this.modal = new Modal(this.modalElement().nativeElement);
  }

  ngOnDestroy(): void {
    this.modal?.dispose();
  }

  open(service: Service | null): void {
    this.service.set(service);
    this.busySlots.set([]);
    this.loadError.set(null);
    this.selectedRange.set(null);
    this.startTime.set('');
    this.endTime.set('');
    this.isOpen.set(true);
    this.modal?.show();
  }

  protected onCancel(): void {
    this.modal?.hide();
    this.isOpen.set(false);
  }

  protected optionSuffix(option: TimeOption): string {
    if (option.reason === 'booked') return ' — Booked';
    if (option.reason === 'unavailable') return ' — Unavailable';
    return '';
  }

  protected onMonthChanged(range: { from: string; to: string }): void {
    const service = this.service();
    if (!service) return;
    this.api.getAvailability(service.id, range.from, range.to).subscribe({
      next: (availability) => {
        this.busySlots.set(
          availability.slots.map((slot, index) => ({
            id: `${slot.bookingStartDate}-${index}`,
            serviceId: service.id,
            serviceIcon: service.icon,
            bookingStartDate: slot.bookingStartDate,
            bookingEndDate: slot.bookingEndDate,
            bookingStartTime: slot.bookingStartTime,
            bookingEndTime: slot.bookingEndTime,
          })),
        );
      },
      error: (error: ApiError) => this.loadError.set(error.message),
    });
  }

  protected onRangeSelected(range: { start: string; end: string }): void {
    this.selectedRange.set(range);

    const start = this.startTime();
    if (start && this.startTimeOptions().find((o) => o.value === start)?.disabled) {
      this.startTime.set('');
      this.endTime.set('');
      return;
    }
    const end = this.endTime();
    if (end && this.endTimeOptions().find((o) => o.value === end)?.disabled) {
      this.endTime.set('');
    }
  }

  protected onStartTimeSelected(value: string): void {
    this.startTime.set(value);
    const end = this.endTime();
    if (end && !this.endTimeOptions().some((o) => o.value === end && !o.disabled)) {
      this.endTime.set('');
    }
  }

  protected onConfirm(): void {
    const range = this.selectedRange();
    if (!range || !this.canConfirm()) return;

    const is24Hours = this.effectiveSchedule().is24Hours;
    this.confirmed.emit({
      bookingStartDate: range.start,
      bookingEndDate: range.end,
      bookingStartTime: is24Hours ? '' : this.startTime(),
      bookingEndTime: is24Hours ? '' : this.endTime(),
    });
    this.modal?.hide();
    this.isOpen.set(false);
  }
}
