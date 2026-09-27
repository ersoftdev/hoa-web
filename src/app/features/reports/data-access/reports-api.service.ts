import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { HoaApiService } from '../../../core/api/hoa-api.service';
import { ReportExportFormat } from '../../../shared/components/export-menu/export-menu.component';
import { PagedResult } from '../../../shared/models/paged-result.model';
import { DownloadFileService } from '../../../shared/services/download-file.service';
import {
  BoardMemberReportRow,
  HomeownersReportRow,
  ReportTypeSummary,
  ServicePaymentReportRow,
  ServiceRequestReportRow,
  UserActivityReportRow,
} from '../models/report.model';

type QueryParamValue = string | number | boolean | undefined;

export interface HomeownersReportQuery {
  [key: string]: QueryParamValue;
  page: number;
  pageSize: number;
  name?: string;
  createdFrom?: string;
  createdTo?: string;
}

export interface BoardMemberReportQuery {
  [key: string]: QueryParamValue;
  page: number;
  pageSize: number;
  hoaYear?: number;
  name?: string;
  position?: string;
}

export interface ServiceRequestReportQuery {
  [key: string]: QueryParamValue;
  page: number;
  pageSize: number;
  requestedFrom?: string;
  requestedTo?: string;
  homeownerId?: string;
  homeownerName?: string;
  serviceId?: string;
}

export interface ServicePaymentReportQuery {
  [key: string]: QueryParamValue;
  page: number;
  pageSize: number;
  paidFrom?: string;
  paidTo?: string;
  serviceId?: string;
  homeownerId?: string;
  homeownerName?: string;
  method?: 'Online' | 'Cash';
}

export interface UserActivityReportQuery {
  [key: string]: QueryParamValue;
  page: number;
  pageSize: number;
  activityFrom?: string;
  activityTo?: string;
  homeownerName?: string;
}

function toParams<T extends Record<string, QueryParamValue>>(query: T): Record<string, string | number | boolean> {
  const params: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') params[key] = value;
  }
  return params;
}

@Injectable({ providedIn: 'root' })
export class ReportsApiService {
  private readonly hoaApi = inject(HoaApiService);
  private readonly downloadFile = inject(DownloadFileService);

  listReportTypes(): Observable<ReportTypeSummary[]> {
    return this.hoaApi.get<ReportTypeSummary[]>('/reports/types');
  }

  listHomeowners(query: HomeownersReportQuery): Observable<PagedResult<HomeownersReportRow>> {
    return this.hoaApi.get<PagedResult<HomeownersReportRow>>('/reports/homeowners', toParams(query));
  }

  listBoardMembers(query: BoardMemberReportQuery): Observable<PagedResult<BoardMemberReportRow>> {
    return this.hoaApi.get<PagedResult<BoardMemberReportRow>>('/reports/board-members', toParams(query));
  }

  listServiceRequests(query: ServiceRequestReportQuery): Observable<PagedResult<ServiceRequestReportRow>> {
    return this.hoaApi.get<PagedResult<ServiceRequestReportRow>>('/reports/service-requests', toParams(query));
  }

  listServicePayments(query: ServicePaymentReportQuery): Observable<PagedResult<ServicePaymentReportRow>> {
    return this.hoaApi.get<PagedResult<ServicePaymentReportRow>>('/reports/service-payments', toParams(query));
  }

  listUserActivities(query: UserActivityReportQuery): Observable<PagedResult<UserActivityReportRow>> {
    return this.hoaApi.get<PagedResult<UserActivityReportRow>>('/reports/user-activities', toParams(query));
  }

  export(
    path: string,
    filters: Record<string, string | number | boolean | undefined>,
    format: ReportExportFormat,
  ): Observable<void> {
    return this.hoaApi.getBlob(path, toParams({ ...filters, format })).pipe(
      map((response) => {
        const filename = this.downloadFile.filenameFromContentDisposition(
          response.headers.get('Content-Disposition'),
          `report.${format === 'excel' ? 'xlsx' : format}`,
        );
        if (response.body) this.downloadFile.save(response.body, filename);
      }),
    );
  }
}
