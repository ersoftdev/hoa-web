import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';

import { ApiError } from '../../../../core/http/api-error.model';
import { ExportMenuComponent, ReportExportFormat } from '../../../../shared/components/export-menu/export-menu.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { SearchBarComponent } from '../../../../shared/components/search-bar/search-bar.component';
import { PagedResult } from '../../../../shared/models/paged-result.model';
import { ReportsApiService } from '../../data-access/reports-api.service';
import { UserActivityReportRow } from '../../models/report.model';

type LoadState = 'loading' | 'success' | 'error';
const PAGE_SIZE = 20;

@Component({
  selector: 'app-user-activity-report',
  imports: [
    DatePipe,
    PageHeaderComponent,
    SearchBarComponent,
    PaginationComponent,
    EmptyStateComponent,
    LoadingStateComponent,
    ErrorStateComponent,
    ExportMenuComponent,
  ],
  templateUrl: './user-activity-report.component.html',
})
export class UserActivityReportComponent {
  private readonly api = inject(ReportsApiService);

  protected readonly state = signal<LoadState>('loading');
  protected readonly result = signal<PagedResult<UserActivityReportRow> | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly exporting = signal(false);

  protected readonly homeownerName = signal('');
  protected readonly activityFrom = signal('');
  protected readonly activityTo = signal('');
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
    this.activityFrom.set((event.target as HTMLInputElement).value);
    this.page.set(1);
    this.load();
  }

  protected onToChange(event: Event): void {
    this.activityTo.set((event.target as HTMLInputElement).value);
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
        '/reports/user-activities/export',
        {
          homeownerName: this.homeownerName() || undefined,
          activityFrom: this.activityFrom() || undefined,
          activityTo: this.activityTo() || undefined,
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
      .listUserActivities({
        page: this.page(),
        pageSize: this.pageSize,
        homeownerName: this.homeownerName() || undefined,
        activityFrom: this.activityFrom() || undefined,
        activityTo: this.activityTo() || undefined,
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
