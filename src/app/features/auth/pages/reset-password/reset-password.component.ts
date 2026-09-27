import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/auth/auth.service';
import { ApiError } from '../../../../core/http/api-error.model';
import { passwordsMatchValidator } from '../../../../shared/validators/passwords-match.validator';

type ViewState = 'form' | 'success' | 'invalid';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  private readonly token = this.route.snapshot.queryParamMap.get('token');

  protected readonly viewState = signal<ViewState>(this.token ? 'form' : 'invalid');
  protected readonly submitting = signal(false);
  protected readonly serverError = signal<string | null>(null);
  protected readonly showPassword = signal(false);

  protected readonly form = this.fb.nonNullable.group(
    {
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordsMatchValidator() },
  );

  protected onSubmit(): void {
    if (this.form.invalid || this.submitting() || !this.token) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.serverError.set(null);

    this.auth.resetPassword({ token: this.token, password: this.form.getRawValue().password }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.viewState.set('success');
      },
      error: (error: ApiError) => {
        this.submitting.set(false);
        this.serverError.set(error.message);
      },
    });
  }
}
