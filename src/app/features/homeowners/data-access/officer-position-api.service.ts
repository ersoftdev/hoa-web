import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { HoaApiService } from '../../../core/api/hoa-api.service';
import { CreateOfficerPositionRequest, OfficerPosition, UpdateOfficerPositionRequest } from '../models/officer-position.model';

@Injectable({ providedIn: 'root' })
export class OfficerPositionApiService {
  private readonly hoaApi = inject(HoaApiService);

  list(): Observable<OfficerPosition[]> {
    return this.hoaApi.get<OfficerPosition[]>('/officer-positions');
  }

  create(request: CreateOfficerPositionRequest): Observable<OfficerPosition> {
    return this.hoaApi.post<OfficerPosition>('/officer-positions', request);
  }

  update(id: string, request: UpdateOfficerPositionRequest): Observable<OfficerPosition> {
    return this.hoaApi.patch<OfficerPosition>(`/officer-positions/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.hoaApi.delete<void>(`/officer-positions/${id}`);
  }
}
