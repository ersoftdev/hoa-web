import { DatePipe, TitleCasePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/auth/auth.service';
import { ApiError } from '../../../../core/http/api-error.model';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { HoaCurrencyPipe } from '../../../../shared/pipes/hoa-currency.pipe';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { ConfirmationDialogService } from '../../../../shared/services/confirmation-dialog.service';
import { ServicesApiService } from '../../data-access/services-api.service';
import { Service, ServiceLifecycleAction } from '../../models/service.model';

type LoadState = 'loading' | 'success' | 'error';

@Component({
  selector: 'app-service-detail',
  imports: [
    RouterLink,
    HoaCurrencyPipe,
    DatePipe,
    TitleCasePipe,
    PageHeaderComponent,
    StatusBadgeComponent,
    LoadingStateComponent,
    ErrorStateComponent,
  ],
  templateUrl: './service-detail.component.html',
})
export class ServiceDetailComponent {
  private readonly api = inject(ServicesApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);
  private readonly confirmationDialog = inject(ConfirmationDialogService);

  protected readonly canManage = this.auth.hasPermission('CAN_MANAGE_SERVICES');
  protected readonly canRequest = this.auth.hasPermission('CAN_REQUEST_SERVICES');

  protected readonly state = signal<LoadState>('loading');
  protected readonly service = signal<Service | null>(null);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly actionPending = signal(false);
  protected readonly actionError = signal<string | null>(null);
  protected readonly boardApprovePending = signal(false);

  protected readonly nextAction = computed<{ action: ServiceLifecycleAction; label: string } | null>(() => {
    switch (this.service()?.status) {
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
  });

  protected readonly canArchive = computed(() => this.service()?.status === 'Inactive');
  protected readonly totalRate = computed(() => this.service()?.rates.reduce((sum, rate) => sum + rate.amount, 0) ?? 0);
  protected readonly boardApprovalProgress = computed(() => {
    const approval = this.service()?.boardApproval;
    if (!approval || approval.requiredCount === 0) return 0;
    return Math.min(100, Math.round((approval.approvedCount / approval.requiredCount) * 100));
  });

  constructor() {
    this.load();
  }

  protected load(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage.set('Missing service id.');
      this.state.set('error');
      return;
    }

    this.state.set('loading');
    this.api.get(id).subscribe({
      next: (service) => {
        this.service.set(service);
        this.state.set('success');
      },
      error: (error: ApiError) => {
        this.errorMessage.set(error.message);
        this.state.set('error');
      },
    });
  }

  protected async onLifecycleAction(action: ServiceLifecycleAction, label: string): Promise<void> {
    const service = this.service();
    if (!service) return;

    const confirmed = await this.confirmationDialog.confirm({
      title: `${label} "${service.name}"?`,
      message:
        action === 'archive'
          ? 'Archived services can no longer be requested and are hidden from the catalog.'
          : `This changes what homeowners see for this service.`,
      confirmLabel: label,
      variant: action === 'deactivate' || action === 'archive' ? 'danger' : 'primary',
    });
    if (!confirmed) return;

    this.actionPending.set(true);
    this.actionError.set(null);
    this.api.setStatus(service.id, action).subscribe({
      next: (updated) => {
        this.service.set(updated);
        this.actionPending.set(false);
      },
      error: (error: ApiError) => {
        this.actionError.set(error.message);
        this.actionPending.set(false);
      },
    });
  }

  protected async onBoardApprove(): Promise<void> {
    const service = this.service();
    if (!service) return;

    const confirmed = await this.confirmationDialog.confirm({
      title: 'Approve this service?',
      message: `Add your approval toward the board threshold for "${service.name}"? This can't be undone.`,
      confirmLabel: 'Approve',
    });
    if (!confirmed) return;

    this.boardApprovePending.set(true);
    this.actionError.set(null);
    this.api.approveByBoard(service.id).subscribe({
      next: (updated) => {
        this.service.set(updated);
        this.boardApprovePending.set(false);
      },
      error: (error: ApiError) => {
        this.actionError.set(error.message);
        this.boardApprovePending.set(false);
      },
    });
  }
}
