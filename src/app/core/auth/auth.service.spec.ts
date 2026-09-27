import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { firstValueFrom } from 'rxjs';

import { authEffects } from '../store/auth/auth.effects';
import { authFeature } from '../store/auth/auth.reducer';
import { errorInterceptor } from '../http/error.interceptor';
import { NotificationsService } from '../notifications/notifications.service';
import { AuthService } from './auth.service';
import { TokenStorageService } from './token-storage.service';

describe('AuthService', () => {
  let httpMock: HttpTestingController;
  let auth: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        provideStore({ [authFeature.name]: authFeature.reducer }),
        provideEffects(authEffects),
        { provide: NotificationsService, useValue: { connect: vi.fn(), disconnect: vi.fn() } },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
  });

  afterEach(() => httpMock.verify());

  it('starts signed out', () => {
    expect(auth.isAuthenticated()).toBe(false);
    expect(auth.currentUser()).toBeNull();
    expect(auth.hasPermission('CAN_MANAGE_HOMEOWNERS')).toBe(false);
  });

  it('login() resolves with the signed-in user and updates the signals synchronously with the resolving action', async () => {
    const resultPromise = firstValueFrom(auth.login({ email: 'admin@example.com', password: 'x' }));

    httpMock.expectOne((r) => r.url.includes('/login')).flush({
      user: { id: 'user-1', email: 'admin@example.com', fullName: 'Robin Reyes', roles: ['Admin'] },
      tokens: { accessToken: 'tok', expiresInSeconds: 900 },
    });

    const user = await resultPromise;
    expect(user.fullName).toBe('Robin Reyes');
    expect(auth.isAuthenticated()).toBe(true);
    expect(auth.currentUser()?.fullName).toBe('Robin Reyes');
    expect(auth.hasPermission('CAN_MANAGE_HOMEOWNERS')).toBe(true);
  });

  it('login() rejects with the backend ApiError on failure and leaves the session signed out', async () => {
    const resultPromise = firstValueFrom(auth.login({ email: 'admin@example.com', password: 'wrong' }));

    httpMock
      .expectOne((r) => r.url.includes('/login'))
      .flush({ code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' }, { status: 401, statusText: 'Unauthorized' });

    await expect(resultPromise).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });
    expect(auth.isAuthenticated()).toBe(false);
  });

  it('signInAsDemoUser() establishes a session synchronously, with no HTTP call', () => {
    auth.signInAsDemoUser('BoardMember');

    expect(auth.isAuthenticated()).toBe(true);
    expect(auth.currentUser()?.roles).toEqual(['BoardMember']);
    expect(auth.hasPermission('CAN_MANAGE_SERVICES')).toBe(true);
    expect(auth.hasPermission('CAN_MANAGE_HOMEOWNERS')).toBe(false);
    expect(TestBed.inject(TokenStorageService).current).toBeTruthy();
  });

  it('logout() clears the session even if the server call fails', async () => {
    auth.signInAsDemoUser('Homeowner');
    expect(auth.isAuthenticated()).toBe(true);

    const resultPromise = firstValueFrom(auth.logout());
    httpMock.expectOne((r) => r.url.includes('/logout')).flush(null, { status: 500, statusText: 'Server Error' });
    await resultPromise;

    expect(auth.isAuthenticated()).toBe(false);
    expect(auth.currentUser()).toBeNull();
    expect(TestBed.inject(TokenStorageService).current).toBeNull();
  });

  it('refresh() resolves false and stays signed out on failure, without throwing', async () => {
    const resultPromise = firstValueFrom(auth.refresh());
    httpMock.expectOne((r) => r.url.includes('/refresh')).flush(null, { status: 401, statusText: 'Unauthorized' });

    await expect(resultPromise).resolves.toBe(false);
    expect(auth.isAuthenticated()).toBe(false);
  });
});
