import { Injectable } from '@angular/core';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** 'danger' for destructive actions (deactivate, reject, cancel, ...). */
  variant?: 'primary' | 'danger';
}

/** Minimal interface the dialog component registers itself with — avoids a
 * direct import cycle between the service and the component. */
export interface ConfirmationDialogHost {
  open(options: ConfirmOptions): Promise<boolean>;
}

/**
 * Promise-based confirm() for destructive/important actions (§19: "Require
 * confirmation for important configuration changes", and the same applies
 * to deactivating a homeowner, rejecting a payment, etc.). One
 * ConfirmationDialogComponent is rendered once in AppLayoutComponent and
 * registers itself here — feature code just calls `confirm()` and never
 * touches the component directly.
 */
@Injectable({ providedIn: 'root' })
export class ConfirmationDialogService {
  private host: ConfirmationDialogHost | null = null;

  register(host: ConfirmationDialogHost): void {
    this.host = host;
  }

  confirm(options: ConfirmOptions): Promise<boolean> {
    if (!this.host) {
      // Safety net — should only happen if called before AppLayoutComponent
      // has initialized (e.g. from a public/unauthenticated page).
      return Promise.resolve(window.confirm(options.message));
    }
    return this.host.open(options);
  }
}
