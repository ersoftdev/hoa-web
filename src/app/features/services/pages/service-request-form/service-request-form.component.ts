import { DatePipe, TitleCasePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ApiError } from '../../../../core/http/api-error.model';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { HoaCurrencyPipe } from '../../../../shared/pipes/hoa-currency.pipe';
import { ServiceRequestsApiService } from '../../data-access/service-requests-api.service';
import { ServicesApiService } from '../../data-access/services-api.service';
import { Service } from '../../models/service.model';
import { BookingPickerModalComponent, BookingSelection } from './booking-picker-modal.component';

type LoadState = 'loading' | 'success' | 'error';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

@Component({
  selector: 'app-service-request-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    HoaCurrencyPipe,
    DatePipe,
    TitleCasePipe,
    PageHeaderComponent,
    EmptyStateComponent,
    LoadingStateComponent,
    ErrorStateComponent,
    BookingPickerModalComponent,
  ],
  templateUrl: './service-request-form.component.html',
})
export class ServiceRequestFormComponent {
  private readonly servicesApi = inject(ServicesApiService);
  private readonly requestsApi = inject(ServiceRequestsApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  private readonly preselectedServiceId = this.route.snapshot.paramMap.get('id');
  protected readonly isOpenPicker = !this.preselectedServiceId;

  protected readonly state = signal<LoadState>('loading');
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly submitting = signal(false);
  protected readonly serverError = signal<string | null>(null);

  protected readonly availableServices = signal<Service[]>([]);
  protected readonly selectedService = signal<Service | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    serviceId: [''],
    notes: [''],
    acknowledgeRequirements: [false],
    bookingStartDate: [''],
    bookingEndDate: [''],
    bookingStartTime: [''],
    bookingEndTime: [''],
  });

  private readonly bookingStartDateValue = toSignal(this.form.controls.bookingStartDate.valueChanges, { initialValue: '' });
  private readonly bookingEndDateValue = toSignal(this.form.controls.bookingEndDate.valueChanges, { initialValue: '' });

  protected readonly isBooking = computed(() => this.selectedService()?.schedule.isBookingService ?? false);

  protected readonly bookingDays = computed<number | null>(() => {
    if (!this.isBooking()) return null;
    const start = this.bookingStartDateValue();
    const end = this.bookingEndDateValue();
    if (!start || !end || start > end) return null;
    return Math.round((new Date(end).getTime() - new Date(start).getTime()) / MS_PER_DAY) + 1;
  });

  protected readonly ratesSubtotal = computed(() => this.selectedService()?.rates.reduce((sum, rate) => sum + rate.amount, 0) ?? 0);

  protected readonly totalFee = computed(() => {
    const service = this.selectedService();
    if (!service) return 0;
    const days = this.bookingDays() ?? 1;
    return this.ratesSubtotal() * days + (service.serviceCharge ?? 0);
  });

  protected readonly downPaymentAmount = computed(() => {
    const service = this.selectedService();
    if (!service?.payment.downpaymentRequired || service.payment.downPaymentPercent === null) return null;
    return this.totalFee() * (service.payment.downPaymentPercent / 100);
  });

  constructor() {
    if (this.preselectedServiceId) {
      this.servicesApi.get(this.preselectedServiceId).subscribe({
        next: (service) => {
          this.applySelectedService(service);
          this.state.set('success');
        },
        error: (error: ApiError) => {
          this.errorMessage.set(error.message);
          this.state.set('error');
        },
      });
    } else {
      this.servicesApi.list({ page: 1, pageSize: 100, status: 'Active', bookableNow: true }).subscribe({
        next: (result) => {
          this.availableServices.set(result.items);
          this.state.set('success');
        },
        error: (error: ApiError) => {
          this.errorMessage.set(error.message);
          this.state.set('error');
        },
      });
    }
  }

  protected onServiceSelect(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    this.applySelectedService(this.availableServices().find((service) => service.id === id) ?? null);
  }

  protected onBookingConfirmed(selection: BookingSelection): void {
    this.form.patchValue(selection);
  }

  protected onSubmit(): void {
    const service = this.selectedService();
    if (!service || this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.serverError.set(null);

    const value = this.form.getRawValue();
    this.requestsApi
      .create(service.id, {
        notes: value.notes,
        ...(service.schedule.isBookingService
          ? {
              bookingStartDate: value.bookingStartDate,
              bookingEndDate: value.bookingEndDate,
              ...(service.schedule.is24Hours ? {} : { bookingStartTime: value.bookingStartTime, bookingEndTime: value.bookingEndTime }),
            }
          : {}),
      })
      .subscribe({
        next: (request) => void this.router.navigate(['/app/services/requests', request.id]),
        error: (error: ApiError) => {
          this.submitting.set(false);
          this.serverError.set(error.message);
        },
      });
  }

  private applySelectedService(service: Service | null): void {
    this.selectedService.set(service);
    if (service) {
      this.availableServices.update((services) => (services.some((s) => s.id === service.id) ? services : [...services, service]));
      this.form.controls.serviceId.setValue(service.id);
    }
    this.form.controls.acknowledgeRequirements.setValue(false);
    this.form.controls.acknowledgeRequirements.setValidators(service?.requirements.length ? Validators.requiredTrue : []);
    this.form.controls.acknowledgeRequirements.updateValueAndValidity();

    const isBooking = service?.schedule.isBookingService ?? false;
    const is24Hours = service?.schedule.is24Hours ?? false;
    for (const name of ['bookingStartDate', 'bookingEndDate'] as const) {
      this.form.controls[name].setValue('');
      this.form.controls[name].setValidators(isBooking ? Validators.required : []);
      this.form.controls[name].updateValueAndValidity();
    }
    for (const name of ['bookingStartTime', 'bookingEndTime'] as const) {
      this.form.controls[name].setValue('');
      this.form.controls[name].setValidators(isBooking && !is24Hours ? Validators.required : []);
      this.form.controls[name].updateValueAndValidity();
    }
  }
}
