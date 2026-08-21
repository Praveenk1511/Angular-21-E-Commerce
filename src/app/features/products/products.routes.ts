import type { Routes } from '@angular/router';

import type { AppRouteData } from '@core/models';

/** Catalog routes, lazily loaded as one chunk from the storefront shell. */
export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Shop',
    data: { breadcrumb: 'Shop' } satisfies AppRouteData,
    loadComponent: () => import('./pages/product-list/product-list').then((m) => m.ProductList),
  },
  {
    path: ':id',
    title: 'Product details',
    data: { breadcrumb: 'Product' } satisfies AppRouteData,
    loadComponent: () =>
      import('./pages/product-detail/product-detail').then((m) => m.ProductDetail),
  },
];
