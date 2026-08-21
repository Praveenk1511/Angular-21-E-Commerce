import type { Routes } from '@angular/router';

import type { AppRouteData } from '@core/models';

/**
 * Category browsing routes.
 *
 * There is no category index: `/category` on its own is not a destination, so it
 * falls through to the wildcard and renders the not-found view rather than
 * silently redirecting somewhere the user did not ask for.
 */
export const CATEGORY_ROUTES: Routes = [
  {
    path: ':slug',
    title: 'Category',
    data: { breadcrumb: 'Category' } satisfies AppRouteData,
    loadComponent: () =>
      import('./pages/category-products/category-products').then((m) => m.CategoryProducts),
  },
  {
    path: '**',
    title: 'Page not found',
    loadComponent: () => import('@features/not-found/not-found').then((m) => m.NotFound),
  },
];
