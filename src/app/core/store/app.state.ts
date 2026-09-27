import { AuthState } from './auth/auth.state';
import { EntitlementsState } from './entitlements/entitlements.state';
import { TenantState } from './tenant/tenant.state';

export interface AppState {
  auth: AuthState;
  tenant: TenantState;
  entitlements: EntitlementsState;
}
