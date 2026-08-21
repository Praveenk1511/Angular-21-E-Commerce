import type { Routes } from '@angular/router';

import { SEGMENTS } from '@core/config/route-paths';
import { AuthLayout } from '@core/layout/auth-layout/auth-layout';
import type { AppRouteData } from '@core/models';

/**
 * Authentication area, lazily loaded as one chunk.
 *
 * `AuthLayout` is imported statically so it travels inside this chunk: it is needed
 * the instant any auth route activates, and a second network round trip for the
 * shell would only delay the form.
 *
 * These routes will eventually want the inverse of an auth guard — a
 * "already signed in, go away" guard that redirects authenticated users to their
 * profile. That belongs to the authentication phase.
 */
export const AUTH_ROUTES: Routes = [
  {
    path: '',
    component: AuthLayout,
    // Future: canActivate: [guestOnlyGuard]
    data: { breadcrumb: 'Account' } satisfies AppRouteData,
    children: [
      { path: '', pathMatch: 'full', redirectTo: SEGMENTS.login },
      {
        path: SEGMENTS.login,
        title: 'Sign in',
        data: { breadcrumb: 'Sign in' } satisfies AppRouteData,
        loadComponent: () => import('./pages/login/login').then((m) => m.Login),
      },
      {
        path: SEGMENTS.register,
        title: 'Create account',
        data: { breadcrumb: 'Create account' } satisfies AppRouteData,
        loadComponent: () => import('./pages/register/register').then((m) => m.Register),
      },
      {
        path: SEGMENTS.forgotPassword,
        title: 'Forgot password',
        data: { breadcrumb: 'Forgot password' } satisfies AppRouteData,
        loadComponent: () =>
          import('./pages/forgot-password/forgot-password').then((m) => m.ForgotPassword),
      },
      {
        path: '**',
        title: 'Page not found',
        loadComponent: () => import('@features/not-found/not-found').then((m) => m.NotFound),
      },
    ],
  },
];
