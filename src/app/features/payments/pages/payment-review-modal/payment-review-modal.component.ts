import { AfterViewInit, Component, ElementRef, OnDestroy, inject, output, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Modal } from 'bootstrap';

import { ApiError } from '../../../../core/http/api-error.model';
import { HoaCurrencyPipe } from '../../../../shared/pipes/hoa-currency.pipe';
import { ConfirmationDialogService } from '../../../../shared/services/confirmation-dialog.service';
import { PaymentsApiService } from '../../data-access/payments-api.service';
import { Payment } from '../../models/payment.model';

@Component({
  selector: 'app-payment-review-modal',
  imports: [FormsModule, HoaCurrencyPipe],
  templateUrl: './payment-review-modal.component.html',
})
export class PaymentReviewModalComponent implements AfterViewInit, OnDestroy {
  private readonly api = inject(PaymentsApiService);
  private readonly confirmationDialog = inject(ConfirmationDialogService);
  private readonly modalElement = viewChild.required<ElementRef<HTMLElement>>('modalRef');

  private modal?: Modal;

  protected readonly payment = signal<Payment | null>(null);
  protected readonly adminNotes = signal('');
  protected readonly actionPending = signal(false);
  protected readonly actionError = signal<string | null>(null);

  readonly reviewed = output<Payment>();

  ngAfterViewInit(): void {
    this.modal = new Modal(this.modalElement().nativeElement);
  }

  open(payment: Payment): void {
    this.payment.set(payment);
    this.adminNotes.set('');
    this.actionError.set(null);
    this.modal?.show();
  }

  protected async onApprove(): Promise<void> {
    const payment = this.payment();
    if (!payment) return;

    const confirmed = await this.confirmationDialog.confirm({
      title: 'Approve payment?',
      message: `Approve ${payment.homeownerName}'s payment for ${payment.serviceName}?`,
      confirmLabel: 'Approve',
    });
    if (!confirmed) return;

    this.runAction((notes) => this.api.approve(payment.id, notes || undefined));
  }

  protected async onReject(): Promise<void> {
    const payment = this.payment();
    if (!payment) return;

    if (!this.adminNotes().trim()) {
      this.actionError.set('Add admin notes explaining the rejection before rejecting.');
      return;
    }

    const confirmed = await this.confirmationDialog.confirm({
      title: 'Reject payment?',
      message: `Reject ${payment.homeownerName}'s payment for ${payment.serviceName}? They'll see your notes.`,
      confirmLabel: 'Reject',
      variant: 'danger',
    });
    if (!confirmed) return;

    this.runAction((notes) => this.api.reject(payment.id, notes));
  }

  ngOnDestroy(): void {
    this.modal?.dispose();
  }

  private runAction(action: (notes: string) => ReturnType<PaymentsApiService['approve']>): void {
    this.actionPending.set(true);
    this.actionError.set(null);
    action(this.adminNotes()).subscribe({
      next: (updated) => {
        this.actionPending.set(false);
        this.modal?.hide();
        this.reviewed.emit(updated);
      },
      error: (error: ApiError) => {
        this.actionError.set(error.message);
        this.actionPending.set(false);
      },
    });
  }
}
