import { Component, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ApiError } from '../../../../core/http/api-error.model';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { CurrencyService } from '../../../../shared/services/currency.service';
import { ServicesApiService } from '../../data-access/services-api.service';
import { SERVICE_ICONS } from '../../models/service-icons';
import { RecurrenceFrequency, Service, UpsertServiceRequest } from '../../models/service.model';

type RateGroup = FormGroup<{ label: FormControl<string>; amount: FormControl<number> }>;

@Component({
  selector: 'app-service-form',
  imports: [ReactiveFormsModule, RouterLink, PageHeaderComponent, LoadingStateComponent, ErrorStateComponent],
  templateUrl: './service-form.component.html',
})
export class ServiceFormComponent {
  protected readonly serviceIcons = SERVICE_ICONS;

  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ServicesApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly currency = inject(CurrencyService);

  private readonly id = this.route.snapshot.paramMap.get('id');
  protected readonly isEditMode = this.id !== null;

  protected readonly loadingExisting = signal(this.isEditMode);
  protected readonly loadError = signal<string | null>(null);
  protected readonly submitting = signal(false);
  protected readonly serverError = signal<string | null>(null);

  protected readonly form = this.fb.group({
    name: this.fb.nonNullable.control('', Validators.required),
    description: this.fb.nonNullable.control('', Validators.required),

    isRecurring: this.fb.nonNullable.control(false),
    recurrenceFrequency: this.fb.control<RecurrenceFrequency | null>(null),
    autoNotifyHomeowners: this.fb.nonNullable.control(false),
    fromDate: this.fb.nonNullable.control(''),
    endDate: this.fb.nonNullable.control(''),
    is24Hours: this.fb.nonNullable.control(false),
    startTime: this.fb.nonNullable.control(''),
    endTime: this.fb.nonNullable.control(''),
    isBookingService: this.fb.nonNullable.control(false),
    icon: this.fb.control<string | null>(null),

    capacity: this.fb.control<number | null>(null),

    downpaymentRequired: this.fb.nonNullable.control(false),
    paymentRequired: this.fb.nonNullable.control(false),
    downPaymentPercent: this.fb.control<number | null>(null),
    requireApprovalBeforePayment: this.fb.nonNullable.control(false),

    serviceCharge: this.fb.control<number | null>(null, Validators.min(0)),

    rates: this.fb.array<RateGroup>([]),
    requirements: this.fb.array<FormControl<string>>([]),
  });

  constructor() {
    if (this.isEditMode && this.id) {
      this.api.get(this.id).subscribe({
        next: (service) => this.populateForm(service),
        error: (error: ApiError) => {
          this.loadError.set(error.message);
          this.loadingExisting.set(false);
        },
      });
    } else {
      this.addRate();
      this.applyScheduleValidators();
      this.applyDownpaymentEffects();
    }
  }

  protected get rates(): FormArray<RateGroup> {
    return this.form.controls.rates;
  }

  protected get requirements(): FormArray<FormControl<string>> {
    return this.form.controls.requirements;
  }

  protected addRate(): void {
    this.rates.push(this.buildRateGroup());
  }

  protected removeRate(index: number): void {
    this.rates.removeAt(index);
  }

  protected addRequirement(): void {
    this.requirements.push(this.fb.nonNullable.control('', Validators.required));
  }

  protected removeRequirement(index: number): void {
    this.requirements.removeAt(index);
  }

  protected onRecurringToggle(): void {
    if (this.form.controls.isRecurring.value) {
      this.form.controls.isBookingService.setValue(false);
    }
    this.applyScheduleValidators();
  }

  protected onIs24HoursToggle(): void {
    this.applyScheduleValidators();
  }

  protected onDownpaymentToggle(): void {
    this.applyDownpaymentEffects();
  }

  protected selectIcon(icon: string): void {
    this.form.controls.icon.setValue(icon);
  }

  protected onSubmit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.serverError.set(null);

    const value = this.form.getRawValue();
    const payload: UpsertServiceRequest = {
      name: value.name,
      description: value.description,
      schedule: value.isRecurring
        ? {
            isRecurring: true,
            recurrenceFrequency: value.recurrenceFrequency,
            autoNotifyHomeowners: value.autoNotifyHomeowners,
            fromDate: null,
            endDate: null,
            is24Hours: false,
            startTime: null,
            endTime: null,
            isBookingService: false,
          }
        : {
            isRecurring: false,
            recurrenceFrequency: null,
            autoNotifyHomeowners: false,
            fromDate: value.fromDate,
            endDate: value.endDate,
            is24Hours: value.is24Hours,
            startTime: value.is24Hours ? null : value.startTime,
            endTime: value.is24Hours ? null : value.endTime,
            isBookingService: value.isBookingService,
          },
      capacity: value.capacity,
      icon: !value.isRecurring && value.isBookingService ? value.icon : null,
      payment: {
        paymentRequired: value.downpaymentRequired ? true : value.paymentRequired,
        downpaymentRequired: value.downpaymentRequired,
        downPaymentPercent: value.downpaymentRequired ? value.downPaymentPercent : null,
        requireApprovalBeforePayment: value.requireApprovalBeforePayment,
      },
      serviceCharge: value.serviceCharge,
      rates: value.rates,
      requirements: value.requirements,
    };

    const request$ = this.isEditMode && this.id ? this.api.update(this.id, payload) : this.api.create(payload);
    request$.subscribe({
      next: (service) => void this.router.navigate(['/app/services', service.id]),
      error: (error: ApiError) => {
        this.submitting.set(false);
        this.serverError.set(error.message);
      },
    });
  }

  private applyScheduleValidators(): void {
    const isRecurring = this.form.controls.isRecurring.value;
    const is24Hours = this.form.controls.is24Hours.value;

    this.form.controls.recurrenceFrequency.setValidators(isRecurring ? Validators.required : []);
    this.form.controls.fromDate.setValidators(isRecurring ? [] : Validators.required);
    this.form.controls.endDate.setValidators(isRecurring ? [] : Validators.required);
    this.form.controls.startTime.setValidators(!isRecurring && !is24Hours ? Validators.required : []);
    this.form.controls.endTime.setValidators(!isRecurring && !is24Hours ? Validators.required : []);

    for (const name of ['recurrenceFrequency', 'fromDate', 'endDate', 'startTime', 'endTime'] as const) {
      this.form.controls[name].updateValueAndValidity();
    }
  }

  private applyDownpaymentEffects(): void {
    const downpaymentRequired = this.form.controls.downpaymentRequired.value;
    if (downpaymentRequired) {
      this.form.controls.paymentRequired.setValue(true);
      this.form.controls.paymentRequired.disable();
      this.form.controls.downPaymentPercent.setValidators([Validators.required, Validators.min(1), Validators.max(100)]);
    } else {
      this.form.controls.paymentRequired.enable();
      this.form.controls.downPaymentPercent.clearValidators();
    }
    this.form.controls.downPaymentPercent.updateValueAndValidity();
  }

  private buildRateGroup(label = '', amount = 0): RateGroup {
    return this.fb.nonNullable.group({
      label: this.fb.nonNullable.control(label, Validators.required),
      amount: this.fb.nonNullable.control(amount, [Validators.required, Validators.min(0)]),
    });
  }

  private populateForm(service: Service): void {
    this.form.patchValue({
      name: service.name,
      description: service.description,
      isRecurring: service.schedule.isRecurring,
      recurrenceFrequency: service.schedule.recurrenceFrequency,
      autoNotifyHomeowners: service.schedule.autoNotifyHomeowners,
      fromDate: service.schedule.fromDate ?? '',
      endDate: service.schedule.endDate ?? '',
      is24Hours: service.schedule.is24Hours,
      startTime: service.schedule.startTime ?? '',
      endTime: service.schedule.endTime ?? '',
      isBookingService: service.schedule.isBookingService,
      icon: service.icon,
      capacity: service.capacity,
      downpaymentRequired: service.payment.downpaymentRequired,
      paymentRequired: service.payment.paymentRequired,
      downPaymentPercent: service.payment.downPaymentPercent,
      requireApprovalBeforePayment: service.payment.requireApprovalBeforePayment,
      serviceCharge: service.serviceCharge,
    });

    for (const rate of service.rates) {
      this.rates.push(this.buildRateGroup(rate.label, rate.amount));
    }
    for (const requirement of service.requirements) {
      this.requirements.push(this.fb.nonNullable.control(requirement, Validators.required));
    }

    this.applyScheduleValidators();
    this.applyDownpaymentEffects();
    this.loadingExisting.set(false);
  }
}
