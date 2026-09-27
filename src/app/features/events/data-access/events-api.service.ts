import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { HoaApiService } from '../../../core/api/hoa-api.service';
import { PagedResult } from '../../../shared/models/paged-result.model';
import { ContentLifecycleAction, ContentStatus } from '../models/content-visibility.model';
import { Event, UpsertEventRequest } from '../models/event.model';

export interface EventListQuery {
  page: number;
  pageSize: number;
  when?: 'upcoming' | 'past';
  status?: ContentStatus | 'All';
}

@Injectable({ providedIn: 'root' })
export class EventsApiService {
  private readonly hoaApi = inject(HoaApiService);

  list(query: EventListQuery): Observable<PagedResult<Event>> {
    const params: Record<string, string | number | boolean> = {
      page: query.page,
      pageSize: query.pageSize,
    };
    if (query.when) params['when'] = query.when;
    if (query.status && query.status !== 'All') params['status'] = query.status;

    return this.hoaApi.get<PagedResult<Event>>('/events', params);
  }

  get(id: string): Observable<Event> {
    return this.hoaApi.get<Event>(`/events/${id}`);
  }

  create(payload: UpsertEventRequest): Observable<Event> {
    return this.hoaApi.post<Event>('/events', payload);
  }

  update(id: string, payload: UpsertEventRequest): Observable<Event> {
    return this.hoaApi.patch<Event>(`/events/${id}`, payload);
  }

  setStatus(id: string, action: ContentLifecycleAction): Observable<Event> {
    return this.hoaApi.post<Event>(`/events/${id}/${action}`, {});
  }
}
