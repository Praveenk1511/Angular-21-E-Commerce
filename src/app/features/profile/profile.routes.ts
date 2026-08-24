import type { Routes } from '@angular/router';

import { authGuard } from '@core/guards/auth.guard';
import type { AppRouteData } from '@core/models';
import { ProfileShell } from './profile-shell';

const PROTECTED = { requiresAuth: true } satisfies AppRouteData;

export const PROFILE_ROUTES: Routes = [
  {
    path: '',
    component: ProfileShell,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'overview' },
      {
        path: 'overview',
        title: 'Profile Overview',
        data: { ...PROTECTED, breadcrumb: 'Profile Overview' } satisfies AppRouteData,
        loadComponent: () =>
          import('./pages/profile-overview/profile-overview').then((m) => m.ProfileOverview),
      },
      {
        path: 'addresses',
        title: 'Saved Addresses',
        data: { ...PROTECTED, breadcrumb: 'Saved Addresses' } satisfies AppRouteData,
        loadComponent: () =>
          import('./pages/profile-addresses/profile-addresses').then((m) => m.ProfileAddresses),
      },
      {
        path: 'security',
        title: 'Security Settings',
        data: { ...PROTECTED, breadcrumb: 'Security & Password' } satisfies AppRouteData,
        loadComponent: () =>
          import('./pages/profile-security/profile-security').then((m) => m.ProfileSecurity),
      },
    ],
  },
];
