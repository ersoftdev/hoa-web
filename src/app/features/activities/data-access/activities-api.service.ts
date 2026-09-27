import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { HoaApiService } from '../../../core/api/hoa-api.service';
import { PagedResult } from '../../../shared/models/paged-result.model';
import { ActivityCategory, ActivityLogEntry } from '../models/activity.model';

export interface ActivityListQuery {
  page: number;
  pageSize: number;
  search?: string;
  actorName?: string;
  category?: ActivityCategory | 'All';
  from?: string;
  to?: string;
}

@Injectable({ providedIn: 'root' })
export class ActivitiesApiService {
  private readonly hoaApi = inject(HoaApiService);

  list(query: ActivityListQuery): Observable<PagedResult<ActivityLogEntry>> {
    const params: Record<string, string | number | boolean> = {
      page: query.page,
      pageSize: query.pageSize,
    };
    if (query.search) params['search'] = query.search;
    if (query.actorName) params['actorName'] = query.actorName;
    if (query.category && query.category !== 'All') params['category'] = query.category;
    if (query.from) params['from'] = query.from;
    if (query.to) params['to'] = query.to;

    return this.hoaApi.get<PagedResult<ActivityLogEntry>>('/activities', params);
  }
}
