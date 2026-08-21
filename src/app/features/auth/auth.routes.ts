import type { Routes } from '@angular/router';

import { SEGMENTS } from '@core/config/route-paths';
import { guestOnlyGuard } from '@core/guards/auth.guard';
import { AuthLayout } from '@core/layout/auth-layout/auth-layout';
import type { AppRouteData } from '@core/models';

/**
 * Authentication area, lazily loaded as one chunk.
 *
 * `AuthLayout` is imported statically so it travels inside this chunk: it is needed
 * the instant any auth route activates, and a second network round trip for the
 * shell would only delay the form.
 *
 * The `guestOnlyGuard` redirects already-signed-in users to the home page. It sits
 * on the layout route so every child inherits it without repeating the guard.
 */
export const AUTH_ROUTES: Routes = [
  {
    path: '',
    component: AuthLayout,
    canActivate: [guestOnlyGuard],
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
        path: SEGMENTS.resetPassword,
        title: 'Reset password',
        data: { breadcrumb: 'Reset password' } satisfies AppRouteData,
        loadComponent: () =>
          import('./pages/reset-password/reset-password').then((m) => m.ResetPassword),
      },
      {
        path: '**',
        title: 'Page not found',
        loadComponent: () => import('@features/not-found/not-found').then((m) => m.NotFound),
      },
    ],
  },
];
