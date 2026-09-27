import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ApiError } from '../../../../core/http/api-error.model';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { AnnouncementsApiService } from '../../data-access/announcements-api.service';
import { VISIBILITY_LABELS, Visibility } from '../../models/content-visibility.model';

@Component({
  selector: 'app-announcement-form',
  imports: [ReactiveFormsModule, RouterLink, PageHeaderComponent, LoadingStateComponent, ErrorStateComponent],
  templateUrl: './announcement-form.component.html',
})
export class AnnouncementFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(AnnouncementsApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly id = this.route.snapshot.paramMap.get('id');
  protected readonly isEditMode = this.id !== null;
  protected readonly visibilityOptions = Object.entries(VISIBILITY_LABELS) as Array<[Visibility, string]>;

  protected readonly loadingExisting = signal(this.isEditMode);
  protected readonly loadError = signal<string | null>(null);
  protected readonly submitting = signal(false);
  protected readonly serverError = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    content: ['', Validators.required],
    visibility: this.fb.nonNullable.control<Visibility>('HOMEOWNERS'),
  });

  constructor() {
    if (this.isEditMode && this.id) {
      this.api.get(this.id).subscribe({
        next: (announcement) => {
          this.form.patchValue({
            title: announcement.title,
            content: announcement.content,
            visibility: announcement.visibility,
          });
          this.loadingExisting.set(false);
        },
        error: (error: ApiError) => {
          this.loadError.set(error.message);
          this.loadingExisting.set(false);
        },
      });
    }
  }

  protected onSubmit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.serverError.set(null);

    const value = this.form.getRawValue();
    const request$ = this.isEditMode && this.id ? this.api.update(this.id, value) : this.api.create(value);
    request$.subscribe({
      next: (announcement) => void this.router.navigate(['/app/announcements', announcement.id]),
      error: (error: ApiError) => {
        this.submitting.set(false);
        this.serverError.set(error.message);
      },
    });
  }
}
