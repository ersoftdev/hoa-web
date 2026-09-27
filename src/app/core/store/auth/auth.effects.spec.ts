import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action, provideStore } from '@ngrx/store';
import { Subject, firstValueFrom } from 'rxjs';

import { HOA_API_BASE_URL, IDENTITY_API_BASE_URL } from '../../api/api-config';
import { AuthUser } from '../../auth/models/auth-user.model';
import { TokenStorageService } from '../../auth/token-storage.service';
import { errorInterceptor } from '../../http/error.interceptor';
import { NotificationsService } from '../../notifications/notifications.service';
import { tenantFeature } from '../tenant/tenant.reducer';
import { AuthActions } from './auth.actions';
import { demoSessionEffect, loginEffect, logoutEffect, refreshEffect } from './auth.effects';

const boardMember: AuthUser = {
  id: 'user-1',
  email: 'board@example.com',
  fullName: 'Alex Santos',
  roles: ['BoardMember'],
};

describe('auth.effects', () => {
  let actions$: Subject<Action>;
  let httpMock: HttpTestingController;
  let tokenStorage: TokenStorageService;
  let notifications: { connect: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    actions$ = new Subject();
    notifications = { connect: vi.fn(), disconnect: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        provideMockActions(() => actions$),
        provideStore({ [tenantFeature.name]: tenantFeature.reducer }),
        { provide: IDENTITY_API_BASE_URL, useValue: '/identity-api' },
        { provide: HOA_API_BASE_URL, useValue: '/hoa-api' },
        { provide: NotificationsService, useValue: notifications },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    tokenStorage = TestBed.inject(TokenStorageService);
  });

  afterEach(() => httpMock.verify());

  it('loginEffect posts credentials, stores the token, connects notifications, and dispatches loginSuccess', async () => {
    const result = firstValueFrom(TestBed.runInInjectionContext(() => loginEffect()));

    actions$.next(AuthActions.loginRequested({ credentials: { email: 'a@b.com', password: 'x' } }));

    const req = httpMock.expectOne('/identity-api/login');
    expect(req.request.body).toEqual({ email: 'a@b.com', password: 'x', associationId: null });
    req.flush({ user: boardMember, tokens: { accessToken: 'tok-1', expiresInSeconds: 900 } });

    const action = await result;
    expect(action).toEqual(
      AuthActions.loginSuccess({ session: { user: boardMember, tokens: { accessToken: 'tok-1', expiresInSeconds: 900 } } }),
    );
    expect(tokenStorage.current).toBe('tok-1');
    expect(notifications.connect).toHaveBeenCalledOnce();
  });

  it('loginEffect dispatches loginFailure with the backend error envelope on failure', async () => {
    const result = firstValueFrom(TestBed.runInInjectionContext(() => loginEffect()));

    actions$.next(AuthActions.loginRequested({ credentials: { email: 'a@b.com', password: 'wrong' } }));

    const req = httpMock.expectOne('/identity-api/login');
    req.flush({ code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' }, { status: 401, statusText: 'Unauthorized' });

    const action = await result;
    expect(action).toEqual(
      AuthActions.loginFailure({
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.', status: 401 },
      }),
    );
  });

  it('refreshEffect succeeds and updates the stored token', async () => {
    const result = firstValueFrom(TestBed.runInInjectionContext(() => refreshEffect()));

    actions$.next(AuthActions.refreshRequested());

    const req = httpMock.expectOne('/identity-api/refresh');
    req.flush({ user: boardMember, tokens: { accessToken: 'tok-2', expiresInSeconds: 900 } });

    const action = await result;
    expect(action.type).toBe(AuthActions.refreshSuccess.type);
    expect(tokenStorage.current).toBe('tok-2');
  });

  it('refreshEffect never surfaces an error — it clears the token and dispatches refreshFailure', async () => {
    tokenStorage.set('stale-token');
    const result = firstValueFrom(TestBed.runInInjectionContext(() => refreshEffect()));

    actions$.next(AuthActions.refreshRequested());

    const req = httpMock.expectOne('/identity-api/refresh');
    req.flush({ code: 'UNAUTHORIZED', message: 'nope' }, { status: 401, statusText: 'Unauthorized' });

    const action = await result;
    expect(action).toEqual(AuthActions.refreshFailure());
    expect(tokenStorage.current).toBeNull();
    expect(notifications.disconnect).toHaveBeenCalledOnce();
  });

  it('logoutEffect clears local session state even if the server call fails', async () => {
    tokenStorage.set('tok');
    const result = firstValueFrom(TestBed.runInInjectionContext(() => logoutEffect()));

    actions$.next(AuthActions.logoutRequested());

    const req = httpMock.expectOne('/identity-api/logout');
    req.flush(null, { status: 500, statusText: 'Server Error' });

    const action = await result;
    expect(action).toEqual(AuthActions.logoutCompleted());
    expect(tokenStorage.current).toBeNull();
    expect(notifications.disconnect).toHaveBeenCalledOnce();
  });

  it('demoSessionEffect fabricates a session with no HTTP call', async () => {
    const result = firstValueFrom(TestBed.runInInjectionContext(() => demoSessionEffect()));

    actions$.next(AuthActions.demoSessionRequested({ role: 'Admin' }));

    const action = await result;
    expect(action.type).toBe(AuthActions.demoSessionStarted.type);
    if (action.type === AuthActions.demoSessionStarted.type) {
      expect(action.user.roles).toEqual(['Admin']);
    }
    expect(tokenStorage.current).toBeTruthy();
    expect(notifications.connect).toHaveBeenCalledOnce();
    httpMock.verify();
  });
});
