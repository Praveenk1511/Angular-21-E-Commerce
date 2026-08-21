import type { Routes } from '@angular/router';

import type { AppRouteData } from '@core/models';

/**
 * Order history routes.
 *
 * `requiresAuth` is declared on each route rather than inherited: the parent
 * `orders` route has a non-empty path, and Angular's default
 * `paramsInheritanceStrategy` of `emptyOnly` does not pass data down from those.
 * Stating it explicitly means a guard reading `snapshot.data` cannot be misled.
 */
const PROTECTED = { requiresAuth: true } satisfies AppRouteData;

export const ORDERS_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Your orders',
    // Future: canActivate: [authGuard]
    data: { ...PROTECTED, breadcrumb: 'Orders' } satisfies AppRouteData,
    loadComponent: () => import('./pages/order-list/order-list').then((m) => m.OrderList),
  },
  {
    path: ':id',
    title: 'Order details',
    // Future: canActivate: [authGuard]
    data: { ...PROTECTED, breadcrumb: 'Order' } satisfies AppRouteData,
    loadComponent: () => import('./pages/order-detail/order-detail').then((m) => m.OrderDetail),
  },
];
