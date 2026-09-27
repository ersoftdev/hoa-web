import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/auth/auth.service';
import { ApiError } from '../../../../core/http/api-error.model';
import { passwordsMatchValidator } from '../../../../shared/validators/passwords-match.validator';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);

  protected readonly submitting = signal(false);
  protected readonly serverError = signal<string | null>(null);
  protected readonly registered = signal(false);
  protected readonly showPassword = signal(false);

  protected readonly form = this.fb.nonNullable.group(
    {
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      address1: ['', [Validators.required]],
      address2: [''],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordsMatchValidator() },
  );

  protected onSubmit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.serverError.set(null);

    const { confirmPassword: _confirmPassword, address2, ...rest } = this.form.getRawValue();
    const payload = { ...rest, address2: address2.trim() || null };

    this.auth.register(payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.registered.set(true);
      },
      error: (error: ApiError) => {
        this.submitting.set(false);
        this.serverError.set(error.message);
      },
    });
  }
}
