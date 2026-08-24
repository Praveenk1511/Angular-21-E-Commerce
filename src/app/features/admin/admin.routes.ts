import type { Routes } from '@angular/router';

import type { AppRouteData } from '@core/models';
import { AdminShell } from './admin-shell';

/**
 * Admin area child routes (/admin/*).
 */
export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminShell,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        title: 'Admin Dashboard',
        data: { breadcrumb: 'Dashboard' } satisfies AppRouteData,
        loadComponent: () =>
          import('./pages/admin-dashboard/admin-dashboard').then((m) => m.AdminDashboardPage),
      },
      {
        path: 'products',
        title: 'Product Management',
        data: { breadcrumb: 'Products' } satisfies AppRouteData,
        loadComponent: () =>
          import('./pages/admin-products/admin-products').then((m) => m.AdminProductsPage),
      },
    ],
  },
];
