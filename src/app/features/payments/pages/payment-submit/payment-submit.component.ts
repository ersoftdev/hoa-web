import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ApiError } from '../../../../core/http/api-error.model';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { CurrencyService } from '../../../../shared/services/currency.service';
import { PaymentsApiService } from '../../data-access/payments-api.service';
import { HOA_BANK_TRANSFER_DETAILS, HOA_GCASH_ACCOUNT_NUMBER } from '../../payment-destinations.constant';
import { OnlinePaymentProvider, PayableItem, PaymentMethod } from '../../models/payment.model';

type LoadState = 'loading' | 'success' | 'error';

@Component({
  selector: 'app-payment-submit',
  imports: [ReactiveFormsModule, RouterLink, PageHeaderComponent, EmptyStateComponent, LoadingStateComponent, ErrorStateComponent],
  templateUrl: './payment-submit.component.html',
})
export class PaymentSubmitComponent {
  private readonly api = inject(PaymentsApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  protected readonly currency = inject(CurrencyService);

  private readonly preselectedServiceRequestId = this.route.snapshot.paramMap.get('serviceRequestId');
  protected readonly isOpenPicker = !this.preselectedServiceRequestId;

  protected readonly gcashAccountNumber = HOA_GCASH_ACCOUNT_NUMBER;
  protected readonly bankTransferDetails = HOA_BANK_TRANSFER_DETAILS;
  protected readonly showScreenshotHelp = signal(false);

  protected readonly state = signal<LoadState>('loading');
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly submitting = signal(false);
  protected readonly serverError = signal<string | null>(null);

  protected readonly payableItems = signal<PayableItem[]>([]);
  protected readonly selectedItem = signal<PayableItem | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    serviceRequestId: [''],
    method: this.fb.nonNullable.control<PaymentMethod>('Online'),
    provider: this.fb.control<OnlinePaymentProvider | null>('GCash'),
    reference: [''],
    amount: this.fb.nonNullable.control<number>(0, [Validators.required, Validators.min(0.01)]),
    screenshotUrl: [''],
    accountReference: [''],
    notes: [''],
  });

  constructor() {
    this.api.listPayableItems().subscribe({
      next: (items) => {
        this.payableItems.set(items);
        if (this.preselectedServiceRequestId) {
          const match = items.find((item) => item.serviceRequestId === this.preselectedServiceRequestId);
          if (!match) {
            this.errorMessage.set('This item is no longer awaiting payment.');
            this.state.set('error');
            return;
          }
          this.applySelectedItem(match);
        }
        this.applyMethodValidators();
        this.state.set('success');
      },
      error: (error: ApiError) => {
        this.errorMessage.set(error.message);
        this.state.set('error');
      },
    });
  }

  protected onItemSelect(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    this.applySelectedItem(this.payableItems().find((item) => item.serviceRequestId === id) ?? null);
  }

  protected onMethodChange(): void {
    this.applyMethodValidators();
  }

  protected onSubmit(): void {
    const item = this.selectedItem();
    if (!item || this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.serverError.set(null);

    const value = this.form.getRawValue();
    const isOnline = value.method === 'Online';
    this.api
      .submit({
        serviceRequestId: item.serviceRequestId,
        isDownpayment: item.isDownpayment,
        amount: value.amount,
        method: value.method,
        provider: isOnline ? value.provider : null,
        reference: isOnline ? value.reference : null,
        screenshotUrl: isOnline ? value.screenshotUrl : null,
        accountReference: isOnline ? value.accountReference : null,
        notes: value.notes || null,
      })
      .subscribe({
        next: (payment) => void this.router.navigate(['/app/payments', payment.id]),
        error: (error: ApiError) => {
          this.submitting.set(false);
          this.serverError.set(error.message);
        },
      });
  }

  private applySelectedItem(item: PayableItem | null): void {
    this.selectedItem.set(item);
    this.form.patchValue({
      serviceRequestId: item?.serviceRequestId ?? '',
      amount: item?.amountDue ?? 0,
    });
  }

  private applyMethodValidators(): void {
    const isOnline = this.form.controls.method.value === 'Online';
    this.form.controls.provider.setValidators(isOnline ? Validators.required : []);
    this.form.controls.reference.setValidators(isOnline ? Validators.required : []);
    this.form.controls.screenshotUrl.setValidators(isOnline ? Validators.required : []);
    this.form.controls.accountReference.setValidators(isOnline ? Validators.required : []);

    if (!isOnline) {
      this.form.patchValue({ provider: null, reference: '', screenshotUrl: '', accountReference: '' });
    } else if (!this.form.controls.provider.value) {
      this.form.controls.provider.setValue('GCash');
    }

    for (const name of ['provider', 'reference', 'screenshotUrl', 'accountReference'] as const) {
      this.form.controls[name].updateValueAndValidity();
    }
  }
}
