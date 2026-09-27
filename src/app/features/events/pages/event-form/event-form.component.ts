import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ApiError } from '../../../../core/http/api-error.model';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { BookingPickerModalComponent, BookingSelection } from '../../../services/pages/service-request-form/booking-picker-modal.component';
import { ServicesApiService } from '../../../services/data-access/services-api.service';
import { Service } from '../../../services/models/service.model';
import { EventsApiService } from '../../data-access/events-api.service';
import { VISIBILITY_LABELS, Visibility } from '../../models/content-visibility.model';
import { Event, UpsertEventRequest } from '../../models/event.model';

function splitIso(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

@Component({
  selector: 'app-event-form',
  imports: [ReactiveFormsModule, RouterLink, PageHeaderComponent, LoadingStateComponent, ErrorStateComponent, BookingPickerModalComponent],
  templateUrl: './event-form.component.html',
})
export class EventFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(EventsApiService);
  private readonly servicesApi = inject(ServicesApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly id = this.route.snapshot.paramMap.get('id');
  protected readonly isEditMode = this.id !== null;
  protected readonly visibilityOptions = Object.entries(VISIBILITY_LABELS) as Array<[Visibility, string]>;

  protected readonly loadingExisting = signal(this.isEditMode);
  protected readonly loadError = signal<string | null>(null);
  protected readonly submitting = signal(false);
  protected readonly serverError = signal<string | null>(null);

  protected readonly availableServices = signal<Service[]>([]);
  protected readonly selectedService = signal<Service | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    location: ['', Validators.required],
    visibility: this.fb.nonNullable.control<Visibility>('HOMEOWNERS'),
    serviceId: [''],
    bookingStartDate: ['', Validators.required],
    bookingEndDate: ['', Validators.required],
    bookingStartTime: [''],
    bookingEndTime: [''],
  });

  constructor() {
    this.servicesApi.list({ page: 1, pageSize: 100, status: 'Active', bookableNow: true }).subscribe({
      next: (result) => this.availableServices.update((services) => mergeById(services, result.items)),
      error: () => undefined, // Non-fatal — the dropdown just stays short; the form itself doesn't depend on this list loading.
    });

    if (this.isEditMode && this.id) {
      this.api.get(this.id).subscribe({
        next: (event) => this.populateForm(event),
        error: (error: ApiError) => {
          this.loadError.set(error.message);
          this.loadingExisting.set(false);
        },
      });
    }
  }

  protected onServiceSelect(domEvent: globalThis.Event): void {
    const id = (domEvent.target as HTMLSelectElement).value;
    this.selectedService.set(id ? (this.availableServices().find((s) => s.id === id) ?? null) : null);
  }

  protected onBookingConfirmed(selection: BookingSelection): void {
    this.form.patchValue(selection);
  }

  protected onSubmit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.serverError.set(null);

    const value = this.form.getRawValue();
    const payload: UpsertEventRequest = {
      title: value.title,
      description: value.description,
      location: value.location,
      visibility: value.visibility,
      serviceId: value.serviceId || null,
      bookingStartDate: value.bookingStartDate,
      bookingEndDate: value.bookingEndDate,
      bookingStartTime: value.bookingStartTime || null,
      bookingEndTime: value.bookingEndTime || null,
    };

    const request$ = this.isEditMode && this.id ? this.api.update(this.id, payload) : this.api.create(payload);
    request$.subscribe({
      next: (event) => void this.router.navigate(['/app/events', event.id]),
      error: (error: ApiError) => {
        this.submitting.set(false);
        this.serverError.set(error.message);
      },
    });
  }

  private populateForm(event: Event): void {
    const booking = event.booking;
    const fallback = booking ? null : { start: splitIso(event.startsAt), end: splitIso(event.endsAt ?? event.startsAt) };

    this.form.patchValue({
      title: event.title,
      description: event.description,
      location: event.location,
      visibility: event.visibility,
      serviceId: booking?.serviceId ?? '',
      bookingStartDate: booking?.bookingStartDate ?? fallback!.start.date,
      bookingEndDate: booking?.bookingEndDate ?? fallback!.end.date,
      bookingStartTime: booking?.bookingStartTime ?? fallback!.start.time,
      bookingEndTime: booking?.bookingEndTime ?? fallback!.end.time,
    });

    if (booking) {
      this.servicesApi.get(booking.serviceId).subscribe({
        next: (service) => {
          this.selectedService.set(service);
          this.availableServices.update((services) => mergeById(services, [service]));
        },
      });
    }

    this.loadingExisting.set(false);
  }
}

function mergeById(existing: Service[], incoming: Service[]): Service[] {
  const byId = new Map(existing.map((s) => [s.id, s]));
  for (const service of incoming) byId.set(service.id, service);
  return [...byId.values()];
}
