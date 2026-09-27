import { DatePipe } from '@angular/common';
import { Component, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ApiError } from '../../../../core/http/api-error.model';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { PagedResult } from '../../../../shared/models/paged-result.model';
import { HoaCurrencyPipe } from '../../../../shared/pipes/hoa-currency.pipe';
import { PaymentsApiService } from '../../data-access/payments-api.service';
import { Payment, PaymentStatus } from '../../models/payment.model';
import { PaymentReviewModalComponent } from '../payment-review-modal/payment-review-modal.component';

type ListMode = 'my' | 'review';
type LoadState = 'loading' | 'success' | 'error';
type DownpaymentFilter = 'All' | 'Downpayment' | 'Full';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-payment-list',
  imports: [
    RouterLink,
    HoaCurrencyPipe,
    DatePipe,
    PageHeaderComponent,
    PaginationComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
    LoadingStateComponent,
    ErrorStateComponent,
    PaymentReviewModalComponent,
  ],
  templateUrl: './payment-list.component.html',
})
export class PaymentListComponent {
  private readonly api = inject(PaymentsApiService);
  private readonly route = inject(ActivatedRoute);

  protected readonly mode: ListMode = (this.route.snapshot.data['mode'] as ListMode | undefined) ?? 'my';
  protected readonly pageTitle: string = (this.route.snapshot.data['breadcrumb'] as string | undefined) ?? 'Payments';

  protected readonly statusTabs: ReadonlyArray<PaymentStatus | 'All'> = [
    'All',
    'Submitted',
    'Under Review',
    'Approved',
    'Rejected',
    'Cancelled',
  ];

  protected readonly state = signal<LoadState>('loading');
  protected readonly result = signal<PagedResult<Payment> | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly statusFilter = signal<PaymentStatus | 'All'>(
    (this.route.snapshot.data['defaultStatus'] as PaymentStatus | undefined) ?? 'All',
  );
  protected readonly downpaymentFilter = signal<DownpaymentFilter>('All');
  protected readonly page = signal(1);
  protected readonly pageSize = PAGE_SIZE;

  private readonly reviewModal = viewChild<PaymentReviewModalComponent>('reviewModal');

  constructor() {
    this.load();

    const reviewPaymentId = this.route.snapshot.queryParamMap.get('reviewPaymentId');
    if (reviewPaymentId && this.mode === 'review') {
      this.api.get(reviewPaymentId).subscribe({
        next: (payment) => this.reviewModal()?.open(payment),
        error: () => undefined,
      });
    }
  }

  protected onStatusTabSelect(status: PaymentStatus | 'All'): void {
    this.statusFilter.set(status);
    this.page.set(1);
    this.load();
  }

  protected onDownpaymentFilterChange(event: Event): void {
    this.downpaymentFilter.set((event.target as HTMLSelectElement).value as DownpaymentFilter);
    this.page.set(1);
    this.load();
  }

  protected onPageChange(page: number): void {
    this.page.set(page);
    this.load();
  }

  protected onReviewed(): void {
    this.load();
  }

  protected load(): void {
    this.state.set('loading');
    const downpaymentFilter = this.downpaymentFilter();
    this.api
      .list({
        page: this.page(),
        pageSize: this.pageSize,
        status: this.statusFilter(),
        mine: this.mode === 'my',
        isDownpayment:
          this.mode === 'review' && downpaymentFilter !== 'All' ? downpaymentFilter === 'Downpayment' : undefined,
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
