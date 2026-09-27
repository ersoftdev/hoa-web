import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';

import { ApiError } from '../../../../core/http/api-error.model';
import { ExportMenuComponent, ReportExportFormat } from '../../../../shared/components/export-menu/export-menu.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { HoaCurrencyPipe } from '../../../../shared/pipes/hoa-currency.pipe';
import { SearchBarComponent } from '../../../../shared/components/search-bar/search-bar.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { PagedResult } from '../../../../shared/models/paged-result.model';
import { ReportsApiService } from '../../data-access/reports-api.service';
import { ServiceRequestReportRow } from '../../models/report.model';

type LoadState = 'loading' | 'success' | 'error';
const PAGE_SIZE = 20;

@Component({
  selector: 'app-service-request-report',
  imports: [
    DatePipe,
    HoaCurrencyPipe,
    PageHeaderComponent,
    SearchBarComponent,
    PaginationComponent,
    EmptyStateComponent,
    LoadingStateComponent,
    ErrorStateComponent,
    ExportMenuComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './service-request-report.component.html',
})
export class ServiceRequestReportComponent {
  private readonly api = inject(ReportsApiService);

  protected readonly state = signal<LoadState>('loading');
  protected readonly result = signal<PagedResult<ServiceRequestReportRow> | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly exporting = signal(false);

  protected readonly homeownerName = signal('');
  protected readonly requestedFrom = signal('');
  protected readonly requestedTo = signal('');
  protected readonly page = signal(1);
  protected readonly pageSize = PAGE_SIZE;

  constructor() {
    this.load();
  }

  protected onSearch(term: string): void {
    this.homeownerName.set(term);
    this.page.set(1);
    this.load();
  }

  protected onFromChange(event: Event): void {
    this.requestedFrom.set((event.target as HTMLInputElement).value);
    this.page.set(1);
    this.load();
  }

  protected onToChange(event: Event): void {
    this.requestedTo.set((event.target as HTMLInputElement).value);
    this.page.set(1);
    this.load();
  }

  protected onPageChange(page: number): void {
    this.page.set(page);
    this.load();
  }

  protected onExport(format: ReportExportFormat): void {
    this.exporting.set(true);
    this.api
      .export(
        '/reports/service-requests/export',
        {
          homeownerName: this.homeownerName() || undefined,
          requestedFrom: this.requestedFrom() || undefined,
          requestedTo: this.requestedTo() || undefined,
        },
        format,
      )
      .subscribe({
        next: () => this.exporting.set(false),
        error: () => this.exporting.set(false),
      });
  }

  protected load(): void {
    this.state.set('loading');
    this.api
      .listServiceRequests({
        page: this.page(),
        pageSize: this.pageSize,
        homeownerName: this.homeownerName() || undefined,
        requestedFrom: this.requestedFrom() || undefined,
        requestedTo: this.requestedTo() || undefined,
      })
      .subscribe({
        next: (result) => {
          this.result.set(result);
          this.state.set('success');
        },
        error: (error: ApiError) => {
          this.errorMessage.set(error.message);
          this.state.set('error');
        },
      });
  }
}
