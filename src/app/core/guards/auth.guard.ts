import { inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';

import { APP_URLS } from '@core/config/route-paths';
import { AuthStore } from '@state/auth.store';

/**
 * Redirects unauthenticated users to the login page.
 *
 * Does not check roles — that is `adminGuard`'s job. Separating the two means a route
 * can require auth without also requiring a specific privilege.
 */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthStore);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree([APP_URLS.auth.login]);
};

/**
 * Redirects authenticated users away from the login/register pages.
 *
 * An already-signed-in user landing on `/auth/login` is confusing rather than useful,
 * so they are sent to the home page instead. Used on the auth layout route.
 */
export const guestOnlyGuard: CanActivateFn = () => {
  const auth = inject(AuthStore);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree([APP_URLS.home]);
};

/**
 * Requires admin or manager role.
 *
 * Sits *after* `authGuard` in the chain, so by the time this runs the user is known to
 * be authenticated. A non-admin authenticated user is sent home rather than to login.
 */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthStore);
  const router = inject(Router);

  if (auth.isManager()) {
    return true;
  }

  return router.createUrlTree([APP_URLS.home]);
};
