import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { HoaApiService } from '../../../core/api/hoa-api.service';
import { AddBoardMembershipRequest, BoardMembership } from '../models/board-membership.model';
import { Homeowner } from '../models/homeowner.model';

@Injectable({ providedIn: 'root' })
export class BoardMembershipApiService {
  private readonly hoaApi = inject(HoaApiService);

  list(hoaYear: number, officersOnly = false): Observable<BoardMembership[]> {
    const params: Record<string, string | number | boolean> = { hoaYear };
    if (officersOnly) params['officersOnly'] = true;
    return this.hoaApi.get<BoardMembership[]>('/board-memberships', params);
  }

  listEligibleHomeowners(hoaYear: number, forOfficerRole: boolean): Observable<Homeowner[]> {
    return this.hoaApi.get<Homeowner[]>('/board-memberships/eligible-homeowners', { hoaYear, forOfficerRole });
  }

  add(request: AddBoardMembershipRequest): Observable<BoardMembership> {
    return this.hoaApi.post<BoardMembership>('/board-memberships', request);
  }

  remove(membershipId: string): Observable<void> {
    return this.hoaApi.delete<void>(`/board-memberships/${membershipId}`);
  }
}
