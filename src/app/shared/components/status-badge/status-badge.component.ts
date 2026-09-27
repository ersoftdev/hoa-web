import { Component, computed, input } from '@angular/core';

const STATUS_VARIANTS: Record<string, string> = {
  Submitted: 'info',
  'Under Review': 'warning',
  Approved: 'success',
  Rejected: 'danger',
  Cancelled: 'secondary',
  Pending: 'warning',
  'Payment Required': 'warning',
  'Downpayment Required': 'warning',
  'Payment Submitted': 'info',
  'Payment Verified': 'info',
  'Downpayment Verified, Payment Completion Required': 'info',
  Completed: 'success',
  'Payment Verification Required': 'warning',
  Active: 'success',
  Inactive: 'secondary',
  Draft: 'secondary',
  Published: 'success',
  Archived: 'secondary',
  Fulfilled: 'success',
  'Downpayment Only — Balance Due': 'warning',
};

@Component({
  selector: 'app-status-badge',
  template: `<span class="badge" [class]="'text-bg-' + variant()">{{ status() }}</span>`,
})
export class StatusBadgeComponent {
  readonly status = input.required<string>();
  protected readonly variant = computed(() => STATUS_VARIANTS[this.status()] ?? 'secondary');
}
