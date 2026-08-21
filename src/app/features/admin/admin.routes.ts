import type { Routes } from '@angular/router';

import { SEGMENTS } from '@core/config/route-paths';
import { AdminLayout } from '@core/layout/admin-layout/admin-layout';
import type { AppRouteData } from '@core/models';

/**
 * Administration area, lazily loaded as one chunk.
 *
 * Access requirements are declared once, on the layout route that owns the whole
 * area, rather than repeated across eight children.
 *
 * Note that children do NOT see these flags in their own `snapshot.data`: Angular's
 * default `emptyOnly` inheritance passes a parent's data down only to children that
 * themselves have an empty path. Consumers starting from a leaf route must use
 * `resolveRouteData()`, which merges the ancestor chain.
 *
 * A guard is unaffected by that: attached to this route it runs for every child and
 * reads its own `data` directly. Protecting the area is therefore a one-line
 * addition here — and `canMatch` rather than `canActivate`, so an unauthorised user
 * never downloads the admin chunk at all.
 */
export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayout,
    // Future: canMatch: [authGuard, adminGuard]
    data: {
      breadcrumb: 'Admin',
      requiresAuth: true,
      requiresAdmin: true,
    } satisfies AppRouteData,
    children: [
      { path: '', pathMatch: 'full', redirectTo: SEGMENTS.dashboard },
      {
        path: SEGMENTS.dashboard,
        title: 'Admin dashboard',
        data: { breadcrumb: 'Dashboard' } satisfies AppRouteData,
        loadComponent: () =>
          import('./pages/admin-dashboard/admin-dashboard').then((m) => m.AdminDashboard),
      },
      {
        path: SEGMENTS.products,
        title: 'Admin products',
        data: { breadcrumb: 'Products' } satisfies AppRouteData,
        loadComponent: () =>
          import('./pages/admin-products/admin-products').then((m) => m.AdminProducts),
      },
      {
        path: SEGMENTS.categories,
        title: 'Admin categories',
        data: { breadcrumb: 'Categories' } satisfies AppRouteData,
        loadComponent: () =>
          import('./pages/admin-categories/admin-categories').then((m) => m.AdminCategories),
      },
      {
        path: SEGMENTS.orders,
        title: 'Admin orders',
        data: { breadcrumb: 'Orders' } satisfies AppRouteData,
        loadComponent: () => import('./pages/admin-orders/admin-orders').then((m) => m.AdminOrders),
      },
      {
        path: SEGMENTS.users,
        title: 'Admin users',
        data: { breadcrumb: 'Users' } satisfies AppRouteData,
        loadComponent: () => import('./pages/admin-users/admin-users').then((m) => m.AdminUsers),
      },
      {
        path: SEGMENTS.inventory,
        title: 'Admin inventory',
        data: { breadcrumb: 'Inventory' } satisfies AppRouteData,
        loadComponent: () =>
          import('./pages/admin-inventory/admin-inventory').then((m) => m.AdminInventory),
      },
      {
        path: SEGMENTS.coupons,
        title: 'Admin coupons',
        data: { breadcrumb: 'Coupons' } satisfies AppRouteData,
        loadComponent: () =>
          import('./pages/admin-coupons/admin-coupons').then((m) => m.AdminCoupons),
      },
      {
        path: SEGMENTS.reports,
        title: 'Admin reports',
        data: { breadcrumb: 'Reports' } satisfies AppRouteData,
        loadComponent: () =>
          import('./pages/admin-reports/admin-reports').then((m) => m.AdminReports),
      },
      {
        path: '**',
        title: 'Page not found',
        loadComponent: () => import('@features/not-found/not-found').then((m) => m.NotFound),
      },
    ],
  },
];
