import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { HoaApiService } from '../../api/hoa-api.service';
import { PagedResult } from '../../../shared/models/paged-result.model';
import { AppNotification } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationsApiService {
  private readonly hoaApi = inject(HoaApiService);

  list(page: number, pageSize: number, unreadOnly = false): Observable<PagedResult<AppNotification>> {
    const params: Record<string, string | number | boolean> = { page, pageSize };
    if (unreadOnly) params['unreadOnly'] = true;
    return this.hoaApi.get<PagedResult<AppNotification>>('/notifications', params);
  }

  unreadCount(): Observable<{ count: number }> {
    return this.hoaApi.get<{ count: number }>('/notifications/unread-count');
  }

  markRead(id: string): Observable<void> {
    return this.hoaApi.post<void>(`/notifications/${id}/read`, {});
  }

  markAllRead(): Observable<void> {
    return this.hoaApi.post<void>('/notifications/read-all', {});
  }
}
