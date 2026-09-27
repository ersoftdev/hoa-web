import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ApiError } from '../../../../core/http/api-error.model';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { HoaCurrencyPipe } from '../../../../shared/pipes/hoa-currency.pipe';
import { RowAction, RowActionsComponent } from '../../../../shared/components/row-actions/row-actions.component';
import { SearchBarComponent } from '../../../../shared/components/search-bar/search-bar.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { ConfirmationDialogService } from '../../../../shared/services/confirmation-dialog.service';
import { PagedResult } from '../../../../shared/models/paged-result.model';
import { ServicesApiService } from '../../data-access/services-api.service';
import { Service, ServiceLifecycleAction, ServiceStatus } from '../../models/service.model';

type LoadState = 'loading' | 'success' | 'error';

const PAGE_SIZE = 12;

@Component({
  selector: 'app-service-list',
  imports: [
    RouterLink,
    HoaCurrencyPipe,
    PageHeaderComponent,
    SearchBarComponent,
    PaginationComponent,
    StatusBadgeComponent,
    RowActionsComponent,
    EmptyStateComponent,
    LoadingStateComponent,
    ErrorStateComponent,
  ],
  templateUrl: './service-list.component.html',
})
export class ServiceListComponent {
  private readonly api = inject(ServicesApiService);
  private readonly confirmationDialog = inject(ConfirmationDialogService);

  protected readonly state = signal<LoadState>('loading');
  protected readonly result = signal<PagedResult<Service> | null>(null);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly searchTerm = signal('');
  protected readonly statusFilter = signal<ServiceStatus | 'All'>('All');
  protected readonly page = signal(1);
  protected readonly pageSize = PAGE_SIZE;

  protected readonly statusActionPendingId = signal<string | null>(null);
  protected readonly actionError = signal<string | null>(null);

  constructor() {
    this.load();
  }

  protected onSearch(term: string): void {
    this.searchTerm.set(term);
    this.page.set(1);
    this.load();
  }

  protected onStatusFilterChange(event: Event): void {
    this.statusFilter.set((event.target as HTMLSelectElement).value as ServiceStatus | 'All');
    this.page.set(1);
    this.load();
  }

  protected onPageChange(page: number): void {
    this.page.set(page);
    this.load();
  }

  protected totalRate(service: Service): number {
    return service.rates.reduce((sum, rate) => sum + rate.amount, 0);
  }

  private nextActionFor(service: Service): { action: ServiceLifecycleAction; label: string } | null {
    switch (service.status) {
      case 'Draft':
        return { action: 'publish', label: 'Publish' };
      case 'Published':
        return { action: 'activate', label: 'Activate' };
      case 'Active':
        return { action: 'deactivate', label: 'Deactivate' };
      case 'Inactive':
        return { action: 'activate', label: 'Reactivate' };
      case 'Archived':
        return { action: 'activate', label: 'Reactivate' };
      default:
        return null;
    }
  }

  protected actionsFor(service: Service): RowAction[] {
    const actions: RowAction[] = [
      { label: 'View', icon: 'eye', routerLink: [service.id] },
      { label: 'Edit', icon: 'pencil-square', routerLink: [service.id, 'edit'] },
    ];

    const pending = this.statusActionPendingId() === service.id;
    const next = this.nextActionFor(service);
    if (next) {
      actions.push({
        label: next.label,
        icon: next.action === 'deactivate' ? 'pause-circle' : next.action === 'publish' ? 'send' : 'play-circle',
        onClick: () => this.onLifecycleAction(service, next.action, next.label),
        pending,
      });
    }
    if (service.status === 'Inactive') {
      actions.push({
        label: 'Archive',
        icon: 'archive',
        colorClass: 'text-danger',
        onClick: () => this.onLifecycleAction(service, 'archive', 'Archive'),
        pending,
      });
    }
    return actions;
  }

  protected async onLifecycleAction(service: Service, action: ServiceLifecycleAction, label: string): Promise<void> {
    const confirmed = await this.confirmationDialog.confirm({
      title: `${label} "${service.name}"?`,
      message:
        action === 'archive'
          ? 'Archived services can no longer be requested and are hidden from the catalog.'
          : 'This changes what homeowners see for this service.',
      confirmLabel: label,
      variant: action === 'deactivate' || action === 'archive' ? 'danger' : 'primary',
    });
    if (!confirmed) return;

    this.actionError.set(null);
    this.statusActionPendingId.set(service.id);
    this.api.setStatus(service.id, action).subscribe({
      next: () => {
        this.statusActionPendingId.set(null);
        this.load();
      },
      error: (error: ApiError) => {
        this.actionError.set(error.message);
        this.statusActionPendingId.set(null);
      },
    });
  }

  protected load(): void {
    this.state.set('loading');
    this.api
      .list({
        page: this.page(),
        pageSize: this.pageSize,
        search: this.searchTerm() || undefined,
        status: this.statusFilter(),
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
