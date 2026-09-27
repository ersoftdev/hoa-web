import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/auth/auth.service';
import { ApiError } from '../../../../core/http/api-error.model';

type ViewState = 'verifying' | 'success' | 'invalid' | 'error';

@Component({
  selector: 'app-verify-email',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './verify-email.component.html',
})
export class VerifyEmailComponent {
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  private readonly token = this.route.snapshot.queryParamMap.get('token');

  protected readonly viewState = signal<ViewState>(this.token ? 'verifying' : 'invalid');
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly resendForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });
  protected readonly resending = signal(false);
  protected readonly resent = signal(false);
  protected readonly resendError = signal<string | null>(null);

  constructor() {
    if (this.token) {
      this.auth.verifyEmail({ token: this.token }).subscribe({
        next: () => this.viewState.set('success'),
        error: (error: ApiError) => {
          this.errorMessage.set(error.message);
          this.viewState.set('error');
        },
      });
    }
  }

  protected onResend(): void {
    if (this.resendForm.invalid || this.resending()) {
      this.resendForm.markAllAsTouched();
      return;
    }

    this.resending.set(true);
    this.resendError.set(null);

    this.auth.resendVerificationEmail(this.resendForm.getRawValue().email).subscribe({
      next: () => {
        this.resending.set(false);
        this.resent.set(true);
      },
      error: (error: ApiError) => {
        this.resending.set(false);
        this.resendError.set(error.message);
      },
    });
  }
}
