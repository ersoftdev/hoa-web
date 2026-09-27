import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { HoaApiService } from '../../../core/api/hoa-api.service';
import { PagedResult } from '../../../shared/models/paged-result.model';
import {
  CreateHomeownerRequest,
  Homeowner,
  HomeownerStatus,
  SetHomeownerStatusRequest,
  UpdateHomeownerRequest,
} from '../models/homeowner.model';

export interface HomeownerListQuery {
  page: number;
  pageSize: number;
  search?: string;
  status?: HomeownerStatus | 'All';
  boardRole?: 'board-member' | 'officer';
}

@Injectable({ providedIn: 'root' })
export class HomeownersApiService {
  private readonly hoaApi = inject(HoaApiService);

  list(query: HomeownerListQuery): Observable<PagedResult<Homeowner>> {
    const params: Record<string, string | number | boolean> = {
      page: query.page,
      pageSize: query.pageSize,
    };
    if (query.search) params['search'] = query.search;
    if (query.status && query.status !== 'All') params['status'] = query.status;
    if (query.boardRole) params['boardRole'] = query.boardRole;

    return this.hoaApi.get<PagedResult<Homeowner>>('/homeowners', params);
  }

  get(id: string): Observable<Homeowner> {
    return this.hoaApi.get<Homeowner>(`/homeowners/${id}`);
  }

  create(request: CreateHomeownerRequest): Observable<Homeowner> {
    return this.hoaApi.post<Homeowner>('/homeowners', request);
  }

  update(id: string, request: UpdateHomeownerRequest): Observable<Homeowner> {
    return this.hoaApi.patch<Homeowner>(`/homeowners/${id}`, request);
  }

  setStatus(id: string, request: SetHomeownerStatusRequest): Observable<Homeowner> {
    const action = request.status === 'Active' ? 'activate' : 'deactivate';
    return this.hoaApi.post<Homeowner>(`/homeowners/${id}/${action}`, { announcementId: request.announcementId });
  }
}
