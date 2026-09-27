import { Pipe, PipeTransform } from '@angular/core';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

/** ISO datetime → "2 minutes ago" — used by the dashboard's Recent
 * Activity list (features/dashboard, features/activities). `dayjs` is
 * already a project dependency; this is its first consumer. */
@Pipe({ name: 'timeAgo' })
export class TimeAgoPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    return dayjs(value).fromNow();
  }
}
