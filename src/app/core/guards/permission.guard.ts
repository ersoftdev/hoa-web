import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../auth/auth.service';
import { Permission } from '../auth/models/permission.model';

export const permissionGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const required = route.data['permission'] as Permission | undefined;
  if (!required || authService.hasPermission(required)) {
    return true;
  }

  return router.createUrlTree(['/app/dashboard']);
};
