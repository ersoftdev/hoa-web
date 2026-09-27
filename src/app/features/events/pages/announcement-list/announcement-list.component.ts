import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/auth/auth.service';
import { ApiError } from '../../../../core/http/api-error.model';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { PagedResult } from '../../../../shared/models/paged-result.model';
import { AnnouncementsApiService } from '../../data-access/announcements-api.service';
import { Announcement } from '../../models/announcement.model';
import { ContentStatus, VISIBILITY_LABELS } from '../../models/content-visibility.model';

type LoadState = 'loading' | 'success' | 'error';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-announcement-list',
  imports: [
    RouterLink,
    DatePipe,
    PageHeaderComponent,
    PaginationComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
    LoadingStateComponent,
    ErrorStateComponent,
  ],
  templateUrl: './announcement-list.component.html',
})
export class AnnouncementListComponent {
  private readonly api = inject(AnnouncementsApiService);
  private readonly auth = inject(AuthService);

  protected readonly canManage = this.auth.hasPermission('CAN_MANAGE_ANNOUNCEMENTS');
  protected readonly visibilityLabels = VISIBILITY_LABELS;

  protected readonly state = signal<LoadState>('loading');
  protected readonly result = signal<PagedResult<Announcement> | null>(null);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly statusFilter = signal<ContentStatus | 'All'>('All');
  protected readonly page = signal(1);
  protected readonly pageSize = PAGE_SIZE;

  constructor() {
    this.load();
  }

  protected onStatusFilterChange(event: Event): void {
    this.statusFilter.set((event.target as HTMLSelectElement).value as ContentStatus | 'All');
    this.page.set(1);
    this.load();
  }

  protected onPageChange(page: number): void {
    this.page.set(page);
    this.load();
  }

  protected load(): void {
    this.state.set('loading');
    this.api
      .list({
        page: this.page(),
        pageSize: this.pageSize,
        status: this.canManage ? this.statusFilter() : undefined,
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
