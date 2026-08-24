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
      {
        path: 'categories',
        title: 'Category Management',
        data: { breadcrumb: 'Categories' } satisfies AppRouteData,
        loadComponent: () =>
          import('./pages/admin-categories/admin-categories').then((m) => m.AdminCategoriesPage),
      },
      {
        path: 'orders',
        title: 'Order Fulfillment',
        data: { breadcrumb: 'Orders' } satisfies AppRouteData,
        loadComponent: () =>
          import('./pages/admin-orders/admin-orders').then((m) => m.AdminOrders),
      },
      {
        path: 'users',
        title: 'User Management',
        data: { breadcrumb: 'Users' } satisfies AppRouteData,
        loadComponent: () =>
          import('./pages/admin-users/admin-users').then((m) => m.AdminUsers),
      },
    ],
  },
];
