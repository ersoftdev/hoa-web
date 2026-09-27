import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';

import { routes } from './app.routes';
import { AuthService } from './core/auth/auth.service';
import { authInterceptor } from './core/http/auth.interceptor';
import { errorInterceptor } from './core/http/error.interceptor';
import { authEffects } from './core/store/auth/auth.effects';
import { authFeature } from './core/store/auth/auth.reducer';

describe('App navigation', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        provideHttpClient(withInterceptors([errorInterceptor, authInterceptor])),
        provideHttpClientTesting(),
        provideStore({ [authFeature.name]: authFeature.reducer }),
        provideEffects(authEffects),
      ],
    });
  });

  it('clicking "New Service Request" on My Requests navigates there', async () => {
    TestBed.inject(AuthService).signInAsDemoUser('Homeowner');

    const harness = await RouterTestingHarness.create('/app/services/my-requests');
    const httpMock = TestBed.inject(HttpTestingController);
    httpMock.expectOne((r) => r.url.includes('/services/requests')).flush({ items: [], total: 0, page: 1, pageSize: 10 });
    harness.detectChanges();

    const link = harness.routeNativeElement?.querySelector('a[href="/app/services/request/new"]');
    expect(link).toBeTruthy();

    (link as HTMLElement).click();
    harness.detectChanges();
    await harness.fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/app/services/request/new');
  });

  it('clicking "Create New Payment" on My Payments navigates there', async () => {
    TestBed.inject(AuthService).signInAsDemoUser('Homeowner');

    const harness = await RouterTestingHarness.create('/app/payments/my');
    const httpMock = TestBed.inject(HttpTestingController);
    httpMock.expectOne((r) => r.url.includes('/payments')).flush({ items: [], total: 0, page: 1, pageSize: 10 });
    harness.detectChanges();

    const link = harness.routeNativeElement?.querySelector('a[href="/app/payments/new"]');
    expect(link).toBeTruthy();

    (link as HTMLElement).click();
    harness.detectChanges();
    await harness.fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/app/payments/new');
  });
});
