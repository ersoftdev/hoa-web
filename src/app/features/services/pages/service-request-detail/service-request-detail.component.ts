import { DatePipe } from '@angular/common';
import { Component, Signal, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from '../../../../core/auth/auth.service';
import { ApiError } from '../../../../core/http/api-error.model';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { HoaCurrencyPipe } from '../../../../shared/pipes/hoa-currency.pipe';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { ConfirmationDialogService } from '../../../../shared/services/confirmation-dialog.service';
import { ServiceRequestsApiService } from '../../data-access/service-requests-api.service';
import { ServiceRequest } from '../../models/service-request.model';

type LoadState = 'loading' | 'success' | 'error';

@Component({
  selector: 'app-service-request-detail',
  imports: [RouterLink, FormsModule, HoaCurrencyPipe, DatePipe, PageHeaderComponent, StatusBadgeComponent, LoadingStateComponent, ErrorStateComponent],
  templateUrl: './service-request-detail.component.html',
})
export class ServiceRequestDetailComponent {
  private readonly api = inject(ServiceRequestsApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);
  private readonly confirmationDialog = inject(ConfirmationDialogService);

  protected readonly canReview = this.auth.hasPermission('CAN_REVIEW_SERVICE_REQUESTS');
  protected readonly canReviewPayments = this.auth.hasPermission('CAN_REVIEW_PAYMENTS');

  protected readonly state = signal<LoadState>('loading');
  protected readonly request = signal<ServiceRequest | null>(null);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly remarks = signal('');
  protected readonly actionPending = signal(false);
  protected readonly actionError = signal<string | null>(null);

  protected readonly displayStatus = computed(() => {
    const request = this.request();
    return request?.pendingPaymentId ? 'Payment Verification Required' : (request?.status ?? '');
  });

  protected readonly isOwnRequest = computed(() => {
    const request = this.request();
    return request !== null && this.auth.currentUser()?.id === request.homeownerId;
  });

  protected readonly statusMessage = computed(() => {
    const request = this.request();
    if (!request) return '';
    if (request.pendingPaymentId) {
      return 'A payment has been submitted for this request and is currently under review.';
    }
    switch (request.status) {
      case 'Pending':
        return 'This request is waiting for admin review before it can proceed.';
      case 'Payment Required':
        return 'This request has been approved — payment is required to proceed.';
      case 'Downpayment Required':
        return 'This request has been approved — a downpayment is required to proceed.';
      case 'Payment Verified':
        return 'Payment has been verified — this request is now awaiting final approval.';
      case 'Downpayment Verified, Payment Completion Required':
        return 'The downpayment has been verified — the service can be used now. The remaining balance is still owed before the service period ends.';
      case 'Approved':
        return 'This request has been approved.';
      case 'Completed':
        return 'This request has been completed.';
      case 'Rejected':
        return 'This request was rejected — see the remarks below.';
      case 'Cancelled':
        return 'This request was cancelled.';
      default:
        return '';
    }
  });

  protected readonly canApprove: Signal<boolean> = computed(() =>
    ['Pending', 'Payment Verified'].includes(this.request()?.status ?? ''),
  );
  protected readonly canReject: Signal<boolean> = computed(() =>
    ['Pending', 'Payment Required', 'Downpayment Required', 'Payment Verified'].includes(this.request()?.status ?? ''),
  );

  constructor() {
    this.load();
  }

  protected load(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage.set('Missing request id.');
      this.state.set('error');
      return;
    }

    this.state.set('loading');
    this.api.get(id).subscribe({
      next: (request) => {
        this.request.set(request);
        this.state.set('success');
      },
      error: (error: ApiError) => {
        this.errorMessage.set(error.message);
        this.state.set('error');
      },
    });
  }

  protected async onApprove(): Promise<void> {
    const request = this.request();
    if (!request) return;

    const confirmed = await this.confirmationDialog.confirm({
      title: 'Approve request?',
      message: `Approve ${request.homeownerName}'s request for ${request.serviceName}?`,
      confirmLabel: 'Approve',
    });
    if (!confirmed) return;

    this.runAction(this.api.approve(request.id, this.remarks() || undefined));
  }

  protected async onReject(): Promise<void> {
    const request = this.request();
    if (!request) return;

    if (!this.remarks().trim()) {
      this.actionError.set('Add a remark explaining the rejection before rejecting.');
      return;
    }

    const confirmed = await this.confirmationDialog.confirm({
      title: 'Reject request?',
      message: `Reject ${request.homeownerName}'s request for ${request.serviceName}? They'll see your remarks.`,
      confirmLabel: 'Reject',
      variant: 'danger',
    });
    if (!confirmed) return;

    this.runAction(this.api.reject(request.id, this.remarks()));
  }

  private runAction(action$: Observable<ServiceRequest>): void {
    this.actionPending.set(true);
    this.actionError.set(null);
    action$.subscribe({
      next: (updated) => {
        this.request.set(updated);
        this.actionPending.set(false);
      },
      error: (error: ApiError) => {
        this.actionError.set(error.message);
        this.actionPending.set(false);
      },
    });
  }
}
