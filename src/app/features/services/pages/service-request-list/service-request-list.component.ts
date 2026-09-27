import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/auth/auth.service';
import { ApiError } from '../../../../core/http/api-error.model';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { RowAction, RowActionsComponent } from '../../../../shared/components/row-actions/row-actions.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { TooltipDirective } from '../../../../shared/directives/tooltip.directive';
import { ConfirmationDialogService } from '../../../../shared/services/confirmation-dialog.service';
import { PagedResult } from '../../../../shared/models/paged-result.model';
import { ServiceRequestsApiService } from '../../data-access/service-requests-api.service';
import { ServiceRequest, ServiceRequestStatus } from '../../models/service-request.model';

type QueueMode = 'queue' | 'my';
type LoadState = 'loading' | 'success' | 'error';

const PAGE_SIZE = 10;

const GROUP_ALL_PAGE_SIZE = 500;

interface ServiceRequestGroup {
  serviceName: string;
  items: ServiceRequest[];
}

const STATUS_TABS: ReadonlyArray<ServiceRequestStatus | 'All'> = [
  'All',
  'Pending',
  'Payment Required',
  'Downpayment Required',
  'Payment Verified',
  'Downpayment Verified, Payment Completion Required',
  'Approved',
  'Completed',
  'Rejected',
  'Cancelled',
];

@Component({
  selector: 'app-service-request-list',
  imports: [
    RouterLink,
    DatePipe,
    PageHeaderComponent,
    PaginationComponent,
    StatusBadgeComponent,
    RowActionsComponent,
    TooltipDirective,
    EmptyStateComponent,
    LoadingStateComponent,
    ErrorStateComponent,
  ],
  templateUrl: './service-request-list.component.html',
})
export class ServiceRequestListComponent {
  private readonly api = inject(ServiceRequestsApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);
  private readonly confirmationDialog = inject(ConfirmationDialogService);

  protected readonly canReviewPayments = this.auth.hasPermission('CAN_REVIEW_PAYMENTS');

  protected readonly mode: QueueMode = (this.route.snapshot.data['mode'] as QueueMode | undefined) ?? 'queue';
  protected readonly pageTitle: string = (this.route.snapshot.data['breadcrumb'] as string | undefined) ?? 'Service Requests';
  protected readonly statusTabs = STATUS_TABS;

  protected readonly state = signal<LoadState>('loading');
  protected readonly result = signal<PagedResult<ServiceRequest> | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly statusFilter = signal<ServiceRequestStatus | 'All'>('All');
  protected readonly page = signal(1);
  protected readonly pageSize = PAGE_SIZE;

  protected readonly groupByService = signal(false);

  protected readonly groupedSections = computed<ServiceRequestGroup[]>(() => {
    const items = this.result()?.items ?? [];
    const byService = new Map<string, ServiceRequest[]>();
    for (const item of items) {
      const group = byService.get(item.serviceName);
      if (group) group.push(item);
      else byService.set(item.serviceName, [item]);
    }
    return [...byService.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([serviceName, groupItems]) => ({ serviceName, items: groupItems }));
  });

  protected readonly approvePendingId = signal<string | null>(null);
  protected readonly actionError = signal<string | null>(null);

  constructor() {
    this.load();
  }

  protected onStatusTabSelect(status: ServiceRequestStatus | 'All'): void {
    this.statusFilter.set(status);
    this.page.set(1);
    this.load();
  }

  protected onPageChange(page: number): void {
    this.page.set(page);
    this.load();
  }

  protected onToggleGroupByService(): void {
    this.groupByService.update((value) => !value);
    this.load();
  }

  protected statusTooltip(status: ServiceRequestStatus): string {
    return status === 'Downpayment Verified, Payment Completion Required'
      ? 'The downpayment has been verified — you can use this service now. The remaining balance is still owed before the service period ends.'
      : '';
  }

  protected displayStatus(request: ServiceRequest): ServiceRequestStatus | 'Payment Verification Required' {
    return request.pendingPaymentId ? 'Payment Verification Required' : request.status;
  }

  protected canApprove(request: ServiceRequest): boolean {
    return request.status === 'Pending' || request.status === 'Payment Verified';
  }

  protected async onApprove(request: ServiceRequest): Promise<void> {
    const confirmed = await this.confirmationDialog.confirm({
      title: 'Approve request?',
      message: `Approve ${request.homeownerName}'s request for ${request.serviceName}?`,
      confirmLabel: 'Approve',
    });
    if (!confirmed) return;

    this.actionError.set(null);
    this.approvePendingId.set(request.id);
    this.api.approve(request.id).subscribe({
      next: () => {
        this.approvePendingId.set(null);
        this.load();
      },
      error: (error: ApiError) => {
        this.actionError.set(error.message);
        this.approvePendingId.set(null);
      },
    });
  }

  protected actionsFor(request: ServiceRequest): RowAction[] {
    const actions: RowAction[] = [{ label: 'View', icon: 'eye', routerLink: ['/app/services/requests', request.id] }];
    if (this.mode === 'queue' && this.canApprove(request)) {
      actions.push({
        label: 'Approve',
        icon: 'check2-circle',
        onClick: () => this.onApprove(request),
        pending: this.approvePendingId() === request.id,
      });
      actions.push({
        label: 'Reject',
        icon: 'x-circle',
        colorClass: 'text-danger',
        routerLink: ['/app/services/requests', request.id],
      });
    }
    if (this.mode === 'queue' && this.canReviewPayments && request.pendingPaymentId) {
      actions.push({
        label: 'Review Payment',
        icon: 'credit-card-2-front',
        routerLink: ['/app/payments'],
        queryParams: { reviewPaymentId: request.pendingPaymentId },
      });
    }
    return actions;
  }

  protected load(): void {
    this.state.set('loading');
    this.api
      .list({
        page: this.groupByService() ? 1 : this.page(),
        pageSize: this.groupByService() ? GROUP_ALL_PAGE_SIZE : this.pageSize,
        status: this.statusFilter(),
        mine: this.mode === 'my',
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
