import { authFeature, selectHasPermission } from './auth.reducer';

export const {
  selectAuthState,
  selectStatus: selectAuthStatus,
  selectUser: selectCurrentUser,
  selectRoles: selectCurrentRoles,
  selectPermissions,
  selectError: selectAuthError,
  selectIsAuthenticated,
  selectPermissionSet,
} = authFeature;

export { selectHasPermission };
