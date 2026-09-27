import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { HoaApiService } from '../../../core/api/hoa-api.service';
import { DashboardRange, DashboardSummary, FinancialOverviewPoint } from '../models/dashboard-summary.model';

@Injectable({ providedIn: 'root' })
export class DashboardApiService {
  private readonly hoaApi = inject(HoaApiService);

  getSummary(range: DashboardRange): Observable<DashboardSummary> {
    return this.hoaApi.get<DashboardSummary>('/dashboard', { range });
  }

  getFinancialOverview(range: DashboardRange): Observable<FinancialOverviewPoint[]> {
    return this.hoaApi.get<FinancialOverviewPoint[]>('/dashboard/financial-overview', { range });
  }
}
