import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';

import { APP_URLS } from '@core/config/route-paths';
import { AuthStore } from '@state/auth.store';

/**
 * Redirects unauthenticated users to the login page with queryParam returnUrl.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthStore);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree([APP_URLS.auth.login], {
    queryParams: { returnUrl: state.url },
  });
};

/**
 * Redirects authenticated users away from the login/register pages.
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
 * Requires admin or manager role. Redirects non-authorized authenticated users to /unauthorized.
 */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthStore);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree([APP_URLS.auth.login]);
  }

  if (auth.isManager()) {
    return true;
  }

  return router.createUrlTree(['/unauthorized']);
};
