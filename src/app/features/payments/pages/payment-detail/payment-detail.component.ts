import { DatePipe } from '@angular/common';
import { Component, Signal, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ApiError } from '../../../../core/http/api-error.model';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { HoaCurrencyPipe } from '../../../../shared/pipes/hoa-currency.pipe';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { PaymentsApiService } from '../../data-access/payments-api.service';
import { Payment } from '../../models/payment.model';

type LoadState = 'loading' | 'success' | 'error';

@Component({
  selector: 'app-payment-detail',
  imports: [HoaCurrencyPipe, DatePipe, PageHeaderComponent, StatusBadgeComponent, LoadingStateComponent, ErrorStateComponent],
  templateUrl: './payment-detail.component.html',
})
export class PaymentDetailComponent {
  private readonly api = inject(PaymentsApiService);
  private readonly route = inject(ActivatedRoute);

  protected readonly state = signal<LoadState>('loading');
  protected readonly payment = signal<Payment | null>(null);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly statusMessage: Signal<string> = computed(() => {
    switch (this.payment()?.status) {
      case 'Submitted':
      case 'Under Review':
        return 'Your payment has been submitted and is currently under review. You will be notified once it is approved or rejected.';
      case 'Approved':
        return 'This payment has been approved.';
      case 'Rejected':
        return 'This payment was rejected — see the admin notes below.';
      case 'Cancelled':
        return 'This payment was cancelled.';
      default:
        return '';
    }
  });

  constructor() {
    this.load();
  }

  protected load(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage.set('Missing payment id.');
      this.state.set('error');
      return;
    }

    this.state.set('loading');
    this.api.get(id).subscribe({
      next: (payment) => {
        this.payment.set(payment);
        this.state.set('success');
      },
      error: (error: ApiError) => {
        this.errorMessage.set(error.message);
        this.state.set('error');
      },
    });
  }
}
