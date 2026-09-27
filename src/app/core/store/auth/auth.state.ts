import { ApiError } from '../../http/api-error.model';
import { AuthUser } from '../../auth/models/auth-user.model';
import { Permission, Role } from '../../auth/models/permission.model';

export type SessionStatus = 'idle' | 'authenticating' | 'authenticated' | 'unauthenticated';

export interface AuthState {
  status: SessionStatus;
  user: AuthUser | null;
  roles: Role[];
  permissions: Permission[];
  error: ApiError | null;
}

export const initialAuthState: AuthState = {
  status: 'idle',
  user: null,
  roles: [],
  permissions: [],
  error: null,
};
