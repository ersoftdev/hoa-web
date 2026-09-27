import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { HoaApiService } from '../../../core/api/hoa-api.service';
import { PagedResult } from '../../../shared/models/paged-result.model';
import { ServiceAvailability } from '../models/service-availability.model';
import { Service, ServiceLifecycleAction, ServiceStatus, UpsertServiceRequest } from '../models/service.model';

export interface ServiceListQuery {
  page: number;
  pageSize: number;
  search?: string;
  status?: ServiceStatus | 'All';
  bookableNow?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ServicesApiService {
  private readonly hoaApi = inject(HoaApiService);

  list(query: ServiceListQuery): Observable<PagedResult<Service>> {
    const params: Record<string, string | number | boolean> = {
      page: query.page,
      pageSize: query.pageSize,
    };
    if (query.search) params['search'] = query.search;
    if (query.status && query.status !== 'All') params['status'] = query.status;
    if (query.bookableNow) params['bookableNow'] = true;

    return this.hoaApi.get<PagedResult<Service>>('/services', params);
  }

  get(id: string): Observable<Service> {
    return this.hoaApi.get<Service>(`/services/${id}`);
  }

  getAvailability(serviceId: string, from: string, to: string): Observable<ServiceAvailability> {
    return this.hoaApi.get<ServiceAvailability>(`/services/${serviceId}/availability`, { from, to });
  }

  create(payload: UpsertServiceRequest): Observable<Service> {
    return this.hoaApi.post<Service>('/services', payload);
  }

  update(id: string, payload: UpsertServiceRequest): Observable<Service> {
    return this.hoaApi.patch<Service>(`/services/${id}`, payload);
  }

  setStatus(id: string, action: ServiceLifecycleAction): Observable<Service> {
    return this.hoaApi.post<Service>(`/services/${id}/${action}`, {});
  }

  approveByBoard(id: string): Observable<Service> {
    return this.hoaApi.post<Service>(`/services/${id}/board-approve`, {});
  }
}
