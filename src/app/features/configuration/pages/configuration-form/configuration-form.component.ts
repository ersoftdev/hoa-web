import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ApiError } from '../../../../core/http/api-error.model';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { ConfirmationDialogService } from '../../../../shared/services/confirmation-dialog.service';
import { CurrencyService } from '../../../../shared/services/currency.service';
import { ConfigurationApiService } from '../../data-access/configuration-api.service';
import { HoaConfiguration } from '../../models/hoa-configuration.model';

type LoadState = 'loading' | 'success' | 'error';

function officerCountValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const max = group.get('maxBoardMembers')?.value as number | null;
    const required = group.get('requiredOfficerCount')?.value as number | null;
    if (max == null || required == null) return null;
    return required > max ? { officerCountExceedsMax: true } : null;
  };
}

@Component({
  selector: 'app-configuration-form',
  imports: [ReactiveFormsModule, RouterLink, DatePipe, PageHeaderComponent, LoadingStateComponent, ErrorStateComponent],
  templateUrl: './configuration-form.component.html',
})
export class ConfigurationFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ConfigurationApiService);
  private readonly confirmationDialog = inject(ConfirmationDialogService);
  private readonly currency = inject(CurrencyService);

  protected readonly state = signal<LoadState>('loading');
  protected readonly loadError = signal<string | null>(null);
  protected readonly submitting = signal(false);
  protected readonly serverError = signal<string | null>(null);
  protected readonly saved = signal(false);
  protected readonly lastUpdated = signal<{ updatedAt: string; updatedBy: string | null } | null>(null);

  protected readonly form = this.fb.group(
    {
      operationYear: this.fb.nonNullable.control(new Date().getFullYear(), [Validators.required, Validators.min(2000), Validators.max(2100)]),
      maxBoardMembers: this.fb.nonNullable.control(7, [Validators.required, Validators.min(1)]),
      requiredOfficerCount: this.fb.nonNullable.control(4, [Validators.required, Validators.min(0)]),
      registrationOpen: this.fb.nonNullable.control(true),
      paymentGracePeriodDays: this.fb.nonNullable.control(15, [Validators.required, Validators.min(0)]),
      currencySymbol: this.fb.nonNullable.control('₱', [Validators.required, Validators.maxLength(3)]),
    },
    { validators: officerCountValidator() },
  );

  constructor() {
    this.api.get().subscribe({
      next: (config) => this.populateForm(config),
      error: (error: ApiError) => {
        this.loadError.set(error.message);
        this.state.set('error');
      },
    });
  }

  protected async onSubmit(): Promise<void> {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    const confirmed = await this.confirmationDialog.confirm({
      title: 'Save configuration changes?',
      message: 'These settings affect the entire HOA — board limits, officer requirements, and registration. Continue?',
      confirmLabel: 'Save Changes',
    });
    if (!confirmed) return;

    this.submitting.set(true);
    this.serverError.set(null);
    this.saved.set(false);

    this.api.update(this.form.getRawValue()).subscribe({
      next: (config) => {
        this.lastUpdated.set({ updatedAt: config.updatedAt, updatedBy: config.updatedBy });
        this.currency.setSymbol(config.currencySymbol);
        this.submitting.set(false);
        this.saved.set(true);
      },
      error: (error: ApiError) => {
        this.submitting.set(false);
        this.serverError.set(error.message);
      },
    });
  }

  private populateForm(config: HoaConfiguration): void {
    this.form.patchValue({
      operationYear: config.operationYear,
      maxBoardMembers: config.maxBoardMembers,
      requiredOfficerCount: config.requiredOfficerCount,
      registrationOpen: config.registrationOpen,
      paymentGracePeriodDays: config.paymentGracePeriodDays,
      currencySymbol: config.currencySymbol,
    });
    this.lastUpdated.set({ updatedAt: config.updatedAt, updatedBy: config.updatedBy });
    this.state.set('success');
  }
}
