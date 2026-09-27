import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ApiError } from '../../../../core/http/api-error.model';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { passwordsMatchValidator } from '../../../../shared/validators/passwords-match.validator';
import { HomeownersApiService } from '../../data-access/homeowners-api.service';

@Component({
  selector: 'app-homeowner-form',
  imports: [ReactiveFormsModule, RouterLink, PageHeaderComponent, LoadingStateComponent, ErrorStateComponent],
  templateUrl: './homeowner-form.component.html',
})
export class HomeownerFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(HomeownersApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly id = this.route.snapshot.paramMap.get('id');
  protected readonly isEditMode = this.id !== null;

  protected readonly loadingExisting = signal(this.isEditMode);
  protected readonly loadError = signal<string | null>(null);
  protected readonly submitting = signal(false);
  protected readonly serverError = signal<string | null>(null);
  protected readonly showPassword = signal(false);

  protected readonly form = this.fb.nonNullable.group(
    {
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      address1: ['', [Validators.required]],
      address2: [''],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      password: [''],
      confirmPassword: [''],
    },
    { validators: passwordsMatchValidator() },
  );

  constructor() {
    if (this.isEditMode && this.id) {
      this.api.get(this.id).subscribe({
        next: (homeowner) => {
          this.form.patchValue({
            fullName: homeowner.fullName,
            email: homeowner.email,
            address1: homeowner.address1,
            address2: homeowner.address2 ?? '',
            city: homeowner.city,
            state: homeowner.state,
          });
          this.form.controls.email.disable();
          this.form.controls.password.disable();
          this.form.controls.confirmPassword.disable();
          this.loadingExisting.set(false);
        },
        error: (error: ApiError) => {
          this.loadError.set(error.message);
          this.loadingExisting.set(false);
        },
      });
    } else {
      this.form.controls.password.addValidators([Validators.required, Validators.minLength(8)]);
      this.form.controls.confirmPassword.addValidators(Validators.required);
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
    const address2 = value.address2.trim() || null;
    const request$ =
      this.isEditMode && this.id
        ? this.api.update(this.id, {
            fullName: value.fullName,
            address1: value.address1,
            address2,
            city: value.city,
            state: value.state,
          })
        : this.api.create({
            fullName: value.fullName,
            email: value.email,
            address1: value.address1,
            address2,
            city: value.city,
            state: value.state,
            password: value.password,
          });

    request$.subscribe({
      next: (homeowner) => void this.router.navigate(['/app/homeowners', homeowner.id]),
      error: (error: ApiError) => {
        this.submitting.set(false);
        this.serverError.set(error.message);
      },
    });
  }
}
