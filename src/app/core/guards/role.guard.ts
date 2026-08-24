import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';

import { APP_URLS } from '@core/config/route-paths';
import type { UserRole } from '@core/models';
import { AuthStore } from '@state/auth.store';

/**
 * Functional Role Guard that checks route `data['requiredRoles']` (e.g. `['admin']` or `['manager', 'admin']`).
 * Redirects unauthenticated users to `/auth/login` and unauthorized users to `/unauthorized`.
 */
export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthStore);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree([APP_URLS.auth.login]);
  }

  const requiredRoles = route.data['requiredRoles'] as readonly UserRole[] | undefined;
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  const userRole = auth.currentUser()?.role;
  if (userRole && requiredRoles.includes(userRole)) {
    return true;
  }

  return router.createUrlTree(['/unauthorized']);
};
