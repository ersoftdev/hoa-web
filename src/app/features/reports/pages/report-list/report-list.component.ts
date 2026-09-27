import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ApiError } from '../../../../core/http/api-error.model';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ReportsApiService } from '../../data-access/reports-api.service';
import { ReportTypeSummary } from '../../models/report.model';

type LoadState = 'loading' | 'success' | 'error';

const PAGE_SIZE = 10;

const ROUTE_BY_CODE: Record<string, string> = {
  'HOA-GEN-DATA': 'homeowners',
  'HOA-BMEM-DATA': 'board-members',
  'HOA-SVCREQ-DATA': 'service-requests',
  'HOA-PAY-DATA': 'service-payments',
  'HOA-ACT-DATA': 'user-activities',
};

@Component({
  selector: 'app-report-list',
  imports: [
    DatePipe,
    RouterLink,
    PageHeaderComponent,
    LoadingStateComponent,
    ErrorStateComponent,
    EmptyStateComponent,
    PaginationComponent,
  ],
  templateUrl: './report-list.component.html',
})
export class ReportListComponent {
  private readonly api = inject(ReportsApiService);

  protected readonly state = signal<LoadState>('loading');
  protected readonly reportTypes = signal<ReportTypeSummary[]>([]);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly page = signal(1);
  protected readonly pageSize = PAGE_SIZE;
  protected readonly pagedReportTypes = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.reportTypes().slice(start, start + this.pageSize);
  });

  constructor() {
    this.load();
  }

  protected routeFor(reportType: ReportTypeSummary): string {
    return ROUTE_BY_CODE[reportType.code] ?? '';
  }

  protected onPageChange(page: number): void {
    this.page.set(page);
  }

  protected load(): void {
    this.state.set('loading');
    this.api.listReportTypes().subscribe({
      next: (reportTypes) => {
        this.reportTypes.set(reportTypes);
        this.page.set(1);
        this.state.set('success');
      },
      error: (error: ApiError) => {
        this.errorMessage.set(error.message);
        this.state.set('error');
      },
    });
  }
}
