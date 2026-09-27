import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  templateUrl: './not-found.component.html',
})
export class NotFoundComponent {
  private readonly auth = inject(AuthService);

  protected readonly homeLink = computed(() => (this.auth.isAuthenticated() ? '/app/dashboard' : '/login'));
  protected readonly homeLabel = computed(() => (this.auth.isAuthenticated() ? 'Go to Dashboard' : 'Go to Sign In'));
}
