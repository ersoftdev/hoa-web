import { Component, computed, effect, input, output, signal } from '@angular/core';
import dayjs, { Dayjs } from 'dayjs';
import { HhmmTimePipe } from '../../pipes/hhmm-time.pipe';
import { CalendarBookingEntry } from './calendar-booking-entry.model';

const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const FALLBACK_SERVICE_ICON = 'calendar-check';

interface CalendarDay {
  date: string; // yyyy-MM-dd
  dayOfMonth: number;
  inCurrentMonth: boolean;
  isToday: boolean;
  isBusy: boolean; // picker mode
  isPendingStart: boolean; // picker mode — first click, awaiting the second
  isRangeStart: boolean; // picker mode — confirmed range's first day
  isRangeEnd: boolean; // picker mode — confirmed range's last day
  isInRange: boolean; // picker mode — any day between/including start+end
  entries: CalendarBookingEntry[]; // view mode
}

@Component({
  selector: 'app-hoa-calendar',
  imports: [HhmmTimePipe],
  templateUrl: './hoa-calendar.component.html',
  styleUrl: './hoa-calendar.component.scss',
})
export class HoaCalendarComponent {
  readonly mode = input.required<'picker' | 'view'>();
  readonly bookings = input<CalendarBookingEntry[]>([]);
  readonly selectable = input(false);

  readonly rangeSelected = output<{ start: string; end: string }>();
  readonly daySelected = output<{ date: string; bookings: CalendarBookingEntry[] }>();
  readonly monthChanged = output<{ from: string; to: string }>();

  protected readonly weekdayLabels = WEEKDAY_LABELS;

  private readonly visibleMonth = signal<Dayjs>(dayjs().startOf('month'));
  private readonly pendingStart = signal<string | null>(null);
  private readonly confirmedRange = signal<{ start: string; end: string } | null>(null);

  protected readonly monthLabel = computed(() => this.visibleMonth().format('MMMM YYYY'));

  private readonly gridStart = computed(() => this.visibleMonth().startOf('month').startOf('week'));
  private readonly gridEnd = computed(() => this.gridStart().add(41, 'day'));

  protected readonly weeks = computed<CalendarDay[][]>(() => {
    const start = this.gridStart();
    const month = this.visibleMonth();
    const today = dayjs().format('YYYY-MM-DD');
    const pending = this.pendingStart();
    const range = this.confirmedRange();
    const entriesByDay = this.groupEntriesByDay();

    const days: CalendarDay[] = Array.from({ length: 42 }, (_, i) => {
      const d = start.add(i, 'day');
      const date = d.format('YYYY-MM-DD');
      const entries = entriesByDay.get(date) ?? [];
      return {
        date,
        dayOfMonth: d.date(),
        inCurrentMonth: d.month() === month.month(),
        isToday: date === today,
        isBusy: entries.length > 0,
        isPendingStart: pending === date,
        isRangeStart: range?.start === date,
        isRangeEnd: range?.end === date,
        isInRange: range ? date >= range.start && date <= range.end : false,
        entries,
      };
    });

    const weeks: CalendarDay[][] = [];
    for (let i = 0; i < 42; i += 7) weeks.push(days.slice(i, i + 7));
    return weeks;
  });

  constructor() {
    effect(() => {
      this.monthChanged.emit({ from: this.gridStart().format('YYYY-MM-DD'), to: this.gridEnd().format('YYYY-MM-DD') });
    });
  }

  protected previousMonth(): void {
    this.pendingStart.set(null);
    this.visibleMonth.update((m) => m.subtract(1, 'month'));
  }

  protected nextMonth(): void {
    this.pendingStart.set(null);
    this.visibleMonth.update((m) => m.add(1, 'month'));
  }

  protected onDayClick(day: CalendarDay): void {
    if (this.mode() === 'view') {
      this.daySelected.emit({ date: day.date, bookings: day.entries });
      return;
    }
    if (!this.selectable()) return;

    const pending = this.pendingStart();
    if (!pending || day.date < pending) {
      this.confirmedRange.set(null);
      this.pendingStart.set(day.date);
      return;
    }
    this.confirmedRange.set({ start: pending, end: day.date });
    this.pendingStart.set(null);
    this.rangeSelected.emit({ start: pending, end: day.date });
  }

  protected iconClass(entry: CalendarBookingEntry): string {
    return `bi-${entry.serviceIcon || FALLBACK_SERVICE_ICON}`;
  }

  private groupEntriesByDay(): Map<string, CalendarBookingEntry[]> {
    const map = new Map<string, CalendarBookingEntry[]>();
    for (const entry of this.bookings()) {
      let cursor = dayjs(entry.bookingStartDate);
      const end = dayjs(entry.bookingEndDate);
      while (cursor.isBefore(end) || cursor.isSame(end, 'day')) {
        const key = cursor.format('YYYY-MM-DD');
        const list = map.get(key);
        if (list) list.push(entry);
        else map.set(key, [entry]);
        cursor = cursor.add(1, 'day');
      }
    }
    return map;
  }
}
