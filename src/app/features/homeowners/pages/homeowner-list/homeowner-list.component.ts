import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/auth/auth.service';
import { ApiError } from '../../../../core/http/api-error.model';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { RowAction, RowActionsComponent } from '../../../../shared/components/row-actions/row-actions.component';
import { SearchBarComponent } from '../../../../shared/components/search-bar/search-bar.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { PagedResult } from '../../../../shared/models/paged-result.model';
import { HomeownersApiService, HomeownerListQuery } from '../../data-access/homeowners-api.service';
import { Homeowner, HomeownerStatus } from '../../models/homeowner.model';

type LoadState = 'loading' | 'success' | 'error';
type BoardRoleFilter = NonNullable<HomeownerListQuery['boardRole']> | 'All';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-homeowner-list',
  imports: [
    RouterLink,
    PageHeaderComponent,
    SearchBarComponent,
    PaginationComponent,
    StatusBadgeComponent,
    RowActionsComponent,
    EmptyStateComponent,
    LoadingStateComponent,
    ErrorStateComponent,
  ],
  templateUrl: './homeowner-list.component.html',
})
export class HomeownerListComponent {
  private readonly api = inject(HomeownersApiService);
  private readonly auth = inject(AuthService);

  protected readonly canManage = this.auth.hasPermission('CAN_MANAGE_HOMEOWNERS');

  protected readonly state = signal<LoadState>('loading');
  protected readonly result = signal<PagedResult<Homeowner> | null>(null);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly searchTerm = signal('');
  protected readonly statusFilter = signal<HomeownerStatus | 'All'>('All');
  protected readonly boardRoleFilter = signal<BoardRoleFilter>('All');
  protected readonly page = signal(1);
  protected readonly pageSize = PAGE_SIZE;

  constructor() {
    this.load();
  }

  protected onSearch(term: string): void {
    this.searchTerm.set(term);
    this.page.set(1);
    this.load();
  }

  protected onStatusFilterChange(event: Event): void {
    this.statusFilter.set((event.target as HTMLSelectElement).value as HomeownerStatus | 'All');
    this.page.set(1);
    this.load();
  }

  protected onBoardRoleFilterChange(event: Event): void {
    this.boardRoleFilter.set((event.target as HTMLSelectElement).value as BoardRoleFilter);
    this.page.set(1);
    this.load();
  }

  protected onPageChange(page: number): void {
    this.page.set(page);
    this.load();
  }

  protected actionsFor(homeowner: Homeowner): RowAction[] {
    const actions: RowAction[] = [{ label: 'View', icon: 'eye', routerLink: [homeowner.id] }];
    if (this.canManage) {
      actions.push({ label: 'Edit', icon: 'pencil-square', routerLink: [homeowner.id, 'edit'] });
    }
    return actions;
  }

  protected load(): void {
    this.state.set('loading');
    const boardRole = this.boardRoleFilter();
    this.api
      .list({
        page: this.page(),
        pageSize: this.pageSize,
        search: this.searchTerm() || undefined,
        status: this.statusFilter(),
        boardRole: boardRole === 'All' ? undefined : boardRole,
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
