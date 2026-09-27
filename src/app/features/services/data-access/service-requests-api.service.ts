import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { HoaApiService } from '../../../core/api/hoa-api.service';
import { PagedResult } from '../../../shared/models/paged-result.model';
import { CreateServiceRequestPayload, ServiceRequest, ServiceRequestStatus } from '../models/service-request.model';

export interface ServiceRequestListQuery {
  page: number;
  pageSize: number;
  status?: ServiceRequestStatus | 'All';
  mine?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ServiceRequestsApiService {
  private readonly hoaApi = inject(HoaApiService);

  list(query: ServiceRequestListQuery): Observable<PagedResult<ServiceRequest>> {
    const params: Record<string, string | number | boolean> = {
      page: query.page,
      pageSize: query.pageSize,
    };
    if (query.status && query.status !== 'All') params['status'] = query.status;
    if (query.mine) params['mine'] = true;

    return this.hoaApi.get<PagedResult<ServiceRequest>>('/services/requests', params);
  }

  get(id: string): Observable<ServiceRequest> {
    return this.hoaApi.get<ServiceRequest>(`/services/requests/${id}`);
  }

  create(serviceId: string, payload: CreateServiceRequestPayload): Observable<ServiceRequest> {
    return this.hoaApi.post<ServiceRequest>(`/services/${serviceId}/requests`, payload);
  }

  approve(id: string, remarks?: string): Observable<ServiceRequest> {
    return this.hoaApi.post<ServiceRequest>(`/services/requests/${id}/approve`, { remarks });
  }

  reject(id: string, remarks: string): Observable<ServiceRequest> {
    return this.hoaApi.post<ServiceRequest>(`/services/requests/${id}/reject`, { remarks });
  }

}
