import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';

import { ApiError } from '../../../../core/http/api-error.model';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { SearchBarComponent } from '../../../../shared/components/search-bar/search-bar.component';
import { PagedResult } from '../../../../shared/models/paged-result.model';
import { ActivitiesApiService } from '../../data-access/activities-api.service';
import { ACTIVITY_CATEGORY_ICONS, ActivityCategory, ActivityLogEntry } from '../../models/activity.model';

type LoadState = 'loading' | 'success' | 'error';

const PAGE_SIZE = 20;
const CATEGORIES: ReadonlyArray<ActivityCategory | 'All'> = [
  'All',
  'Homeowners',
  'Services',
  'Payments',
  'Events',
  'Announcements',
  'Configuration',
  'Account',
];

@Component({
  selector: 'app-activity-list',
  imports: [
    DatePipe,
    PageHeaderComponent,
    SearchBarComponent,
    PaginationComponent,
    EmptyStateComponent,
    LoadingStateComponent,
    ErrorStateComponent,
  ],
  templateUrl: './activity-list.component.html',
})
export class ActivityListComponent {
  private readonly api = inject(ActivitiesApiService);

  protected readonly categories = CATEGORIES;
  protected readonly categoryIcons = ACTIVITY_CATEGORY_ICONS;

  protected readonly state = signal<LoadState>('loading');
  protected readonly result = signal<PagedResult<ActivityLogEntry> | null>(null);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly search = signal('');
  protected readonly actorName = signal('');
  protected readonly category = signal<ActivityCategory | 'All'>('All');
  protected readonly from = signal('');
  protected readonly to = signal('');
  protected readonly page = signal(1);
  protected readonly pageSize = PAGE_SIZE;

  constructor() {
    this.load();
  }

  protected onSearch(term: string): void {
    this.search.set(term);
    this.page.set(1);
    this.load();
  }

  protected onActorFilter(term: string): void {
    this.actorName.set(term);
    this.page.set(1);
    this.load();
  }

  protected onCategoryChange(event: Event): void {
    this.category.set((event.target as HTMLSelectElement).value as ActivityCategory | 'All');
    this.page.set(1);
    this.load();
  }

  protected onFromChange(event: Event): void {
    this.from.set((event.target as HTMLInputElement).value);
    this.page.set(1);
    this.load();
  }

  protected onToChange(event: Event): void {
    this.to.set((event.target as HTMLInputElement).value);
    this.page.set(1);
    this.load();
  }

  protected onPageChange(page: number): void {
    this.page.set(page);
    this.load();
  }

  protected iconFor(category: ActivityCategory): string {
    return ACTIVITY_CATEGORY_ICONS[category];
  }

  protected load(): void {
    this.state.set('loading');
    this.api
      .list({
        page: this.page(),
        pageSize: this.pageSize,
        search: this.search() || undefined,
        actorName: this.actorName() || undefined,
        category: this.category(),
        from: this.from() || undefined,
        to: this.to() || undefined,
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
