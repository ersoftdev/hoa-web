import { createActionGroup, emptyProps, props } from '@ngrx/store';

import { ApiError } from '../../http/api-error.model';
import { AuthSession, AuthUser, LoginCredentials } from '../../auth/models/auth-user.model';
import { Role } from '../../auth/models/permission.model';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    'Login Requested': props<{ credentials: LoginCredentials }>(),
    'Login Success': props<{ session: AuthSession }>(),
    'Login Failure': props<{ error: ApiError }>(),

    'Refresh Requested': emptyProps(),
    'Refresh Success': props<{ session: AuthSession }>(),
    'Refresh Failure': emptyProps(),

    'Logout Requested': emptyProps(),
    'Logout Completed': emptyProps(),

    'Demo Session Requested': props<{ role: Role }>(),
    'Demo Session Started': props<{ user: AuthUser }>(),
  },
});
