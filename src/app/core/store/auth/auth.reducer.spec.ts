import { ApiError } from '../../http/api-error.model';
import { AuthSession, AuthUser } from '../../auth/models/auth-user.model';
import { AuthActions } from './auth.actions';
import { authFeature, selectHasPermission } from './auth.reducer';
import { AuthState, initialAuthState } from './auth.state';

const boardMember: AuthUser = {
  id: 'user-1',
  email: 'board@example.com',
  fullName: 'Alex Santos',
  roles: ['BoardMember'],
};

const session: AuthSession = {
  user: boardMember,
  tokens: { accessToken: 'token', expiresInSeconds: 900 },
};

const apiError: ApiError = { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' };

function rootState(auth: AuthState) {
  return { auth };
}

describe('auth.reducer', () => {
  it('starts idle, signed out', () => {
    expect(initialAuthState).toEqual<AuthState>({
      status: 'idle',
      user: null,
      roles: [],
      permissions: [],
      error: null,
    });
  });

  it('loginRequested moves to authenticating and clears any prior error', () => {
    const state = authFeature.reducer(
      { ...initialAuthState, error: apiError },
      AuthActions.loginRequested({ credentials: { email: 'a@b.com', password: 'x' } }),
    );
    expect(state.status).toBe('authenticating');
    expect(state.error).toBeNull();
  });

  it('loginSuccess establishes the session with roles/permissions derived from the user', () => {
    const state = authFeature.reducer(initialAuthState, AuthActions.loginSuccess({ session }));
    expect(state.status).toBe('authenticated');
    expect(state.user).toEqual(boardMember);
    expect(state.roles).toEqual(['BoardMember']);
    expect(state.permissions).toContain('CAN_MANAGE_SERVICES');
    expect(state.permissions).not.toContain('CAN_MANAGE_HOMEOWNERS');
  });

  it('loginFailure records the error without touching any existing session', () => {
    const authenticated: AuthState = {
      status: 'authenticated',
      user: boardMember,
      roles: boardMember.roles,
      permissions: ['CAN_MANAGE_SERVICES'],
      error: null,
    };
    const state = authFeature.reducer(authenticated, AuthActions.loginFailure({ error: apiError }));
    expect(state.status).toBe('unauthenticated');
    expect(state.error).toEqual(apiError);
  });

  describe('refreshRequested', () => {
    it('moves idle -> authenticating (initial bootstrap)', () => {
      const state = authFeature.reducer(initialAuthState, AuthActions.refreshRequested());
      expect(state.status).toBe('authenticating');
    });

    it('does NOT clear an already-authenticated session (silent mid-session refresh)', () => {
      const authenticated: AuthState = {
        status: 'authenticated',
        user: boardMember,
        roles: boardMember.roles,
        permissions: ['CAN_MANAGE_SERVICES'],
        error: null,
      };
      const state = authFeature.reducer(authenticated, AuthActions.refreshRequested());
      expect(state.status).toBe('authenticated');
      expect(state.user).toEqual(boardMember);
    });
  });

  it('refreshFailure clears the session entirely', () => {
    const authenticated: AuthState = {
      status: 'authenticated',
      user: boardMember,
      roles: boardMember.roles,
      permissions: ['CAN_MANAGE_SERVICES'],
      error: null,
    };
    const state = authFeature.reducer(authenticated, AuthActions.refreshFailure());
    expect(state).toEqual<AuthState>({ ...initialAuthState, status: 'unauthenticated' });
  });

  it('logoutCompleted clears the session entirely', () => {
    const authenticated: AuthState = {
      status: 'authenticated',
      user: boardMember,
      roles: boardMember.roles,
      permissions: ['CAN_MANAGE_SERVICES'],
      error: null,
    };
    const state = authFeature.reducer(authenticated, AuthActions.logoutCompleted());
    expect(state).toEqual<AuthState>({ ...initialAuthState, status: 'unauthenticated' });
  });

  it('demoSessionStarted establishes a session the same way loginSuccess does', () => {
    const state = authFeature.reducer(initialAuthState, AuthActions.demoSessionStarted({ user: boardMember }));
    expect(state.status).toBe('authenticated');
    expect(state.user).toEqual(boardMember);
    expect(state.permissions).toContain('CAN_MANAGE_SERVICES');
  });

  describe('selectors', () => {
    it('selectIsAuthenticated reflects `user`, independent of `status`', () => {
      const midRefresh: AuthState = {
        status: 'authenticating',
        user: boardMember,
        roles: boardMember.roles,
        permissions: [],
        error: null,
      };
      expect(authFeature.selectIsAuthenticated(rootState(midRefresh))).toBe(true);
      expect(authFeature.selectIsAuthenticated(rootState(initialAuthState))).toBe(false);
    });

    it('selectPermissionSet exposes a Set for O(1) hasPermission-style lookups', () => {
      const state: AuthState = { ...initialAuthState, permissions: ['CAN_MANAGE_SERVICES', 'CAN_REQUEST_SERVICES'] };
      const permissions = authFeature.selectPermissionSet(rootState(state));
      expect(permissions).toBeInstanceOf(Set);
      expect(permissions.has('CAN_MANAGE_SERVICES')).toBe(true);
      expect(permissions.has('CAN_MANAGE_HOMEOWNERS')).toBe(false);
    });

    it('selectHasPermission(permission) is a parameterized selector', () => {
      const state: AuthState = { ...initialAuthState, permissions: ['CAN_VIEW_ACTIVITIES'] };
      expect(selectHasPermission('CAN_VIEW_ACTIVITIES')(rootState(state))).toBe(true);
      expect(selectHasPermission('CAN_MANAGE_CONFIGURATION')(rootState(state))).toBe(false);
    });
  });
});
