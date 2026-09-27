import { InjectionToken } from '@angular/core';

import { environment } from '../../../environments/environment';

export const IDENTITY_API_BASE_URL = new InjectionToken<string>('IDENTITY_API_BASE_URL', {
  providedIn: 'root',
  factory: () => environment.identityApiBaseUrl,
});

export const HOA_API_BASE_URL = new InjectionToken<string>('HOA_API_BASE_URL', {
  providedIn: 'root',
  factory: () => environment.hoaApiBaseUrl,
});
