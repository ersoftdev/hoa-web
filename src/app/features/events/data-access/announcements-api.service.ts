import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { HoaApiService } from '../../../core/api/hoa-api.service';
import { PagedResult } from '../../../shared/models/paged-result.model';
import { Announcement, UpsertAnnouncementRequest } from '../models/announcement.model';
import { ContentLifecycleAction, ContentStatus } from '../models/content-visibility.model';

export interface AnnouncementListQuery {
  page: number;
  pageSize: number;
  status?: ContentStatus | 'All';
}

@Injectable({ providedIn: 'root' })
export class AnnouncementsApiService {
  private readonly hoaApi = inject(HoaApiService);

  list(query: AnnouncementListQuery): Observable<PagedResult<Announcement>> {
    const params: Record<string, string | number | boolean> = {
      page: query.page,
      pageSize: query.pageSize,
    };
    if (query.status && query.status !== 'All') params['status'] = query.status;

    return this.hoaApi.get<PagedResult<Announcement>>('/announcements', params);
  }

  get(id: string): Observable<Announcement> {
    return this.hoaApi.get<Announcement>(`/announcements/${id}`);
  }

  create(payload: UpsertAnnouncementRequest): Observable<Announcement> {
    return this.hoaApi.post<Announcement>('/announcements', payload);
  }

  update(id: string, payload: UpsertAnnouncementRequest): Observable<Announcement> {
    return this.hoaApi.patch<Announcement>(`/announcements/${id}`, payload);
  }

  setStatus(id: string, action: ContentLifecycleAction): Observable<Announcement> {
    return this.hoaApi.post<Announcement>(`/announcements/${id}/${action}`, {});
  }
}
