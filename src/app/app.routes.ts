import type { Routes } from '@angular/router';

import { SEGMENTS } from '@core/config/route-paths';
import { adminGuard, authGuard } from '@core/guards/auth.guard';
import { MainLayout } from '@core/layout/main-layout/main-layout';
import type { AppRouteData } from '@core/models';
import { INFO_ROUTES } from '@features/info/info.routes';

/**
 * Root route table.
 *
 * Three areas, each with its own shell:
 *
 * - `/auth/*`   sign-in and recovery, on a stripped-back layout
 * - `/admin/*`  administration, on a sidebar layout
 * - everything else: the storefront, on the main shell
 *
 * ORDER IS LOAD-BEARING. The storefront matches the empty path and owns the
 * catch-all, so it must come last. Listed first, its `**` child would swallow
 * `/auth/login` and `/admin/dashboard` before either area was ever tried.
 *
 * Both areas are lazy via `loadChildren`, so a storefront visitor never downloads
 * admin code. Storefront pages are lazy per feature, and the shell itself is eager
 * because it renders on every navigation.
 *
 * Guards protect routes that require authentication or elevated privilege.
 * See the Phase 03 comment on each route's `data` for which routes carry
 * `requiresAuth` and `requiresAdmin`.
 */
export const routes: Routes = [
  {
    path: SEGMENTS.auth,
    loadChildren: () => import('@features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: SEGMENTS.admin,
    canMatch: [authGuard, adminGuard],
    loadChildren: () => import('@features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },

  {
    path: '',
    component: MainLayout,
    children: [
      /* `/` is not a page of its own: it resolves to the canonical `/home`. */
      { path: '', pathMatch: 'full', redirectTo: SEGMENTS.home },

      {
        path: SEGMENTS.home,
        title: 'Home',
        data: { breadcrumb: 'Home' } satisfies AppRouteData,
        loadComponent: () => import('@features/home/home').then((m) => m.Home),
      },
      {
        path: SEGMENTS.products,
        loadChildren: () =>
          import('@features/products/products.routes').then((m) => m.PRODUCTS_ROUTES),
      },
      {
        path: SEGMENTS.search,
        title: 'Search results',
        data: { breadcrumb: 'Search' } satisfies AppRouteData,
        loadComponent: () => import('@features/search/search-page').then((m) => m.SearchPage),
      },
      {
        path: SEGMENTS.categories,
        title: 'Categories',
        data: { breadcrumb: 'Categories' } satisfies AppRouteData,
        loadComponent: () =>
          import('@features/category/pages/category-list/category-list').then(
            (m) => m.CategoryList,
          ),
      },
      {
        path: SEGMENTS.category,
        loadChildren: () =>
          import('@features/category/category.routes').then((m) => m.CATEGORY_ROUTES),
      },
      {
        path: SEGMENTS.cart,
        title: 'Your cart',
        /* Guest-accessible on purpose: requiring sign-in to hold a cart loses sales. */
        data: { breadcrumb: 'Cart' } satisfies AppRouteData,
        loadComponent: () =>
          import('@features/cart/pages/cart-page/cart-page').then((m) => m.CartPage),
      },
      {
        path: SEGMENTS.wishlist,
        title: 'Your wishlist',
        data: { breadcrumb: 'Wishlist' } satisfies AppRouteData,
        loadComponent: () =>
          import('@features/wishlist/pages/wishlist-page/wishlist-page').then(
            (m) => m.WishlistPage,
          ),
      },
      {
        path: SEGMENTS.checkout,
        title: 'Checkout',
        canActivate: [authGuard],
        data: { breadcrumb: 'Checkout', requiresAuth: true } satisfies AppRouteData,
        loadComponent: () =>
          import('@features/checkout/pages/checkout-page/checkout-page').then(
            (m) => m.CheckoutPage,
          ),
      },
      {
        path: SEGMENTS.orders,
        loadChildren: () => import('@features/orders/orders.routes').then((m) => m.ORDERS_ROUTES),
      },
      {
        path: SEGMENTS.profile,
        loadChildren: () => import('@features/profile/profile.routes').then((m) => m.PROFILE_ROUTES),
      },
      {
        path: SEGMENTS.notifications,
        title: 'Your notifications',
        data: { breadcrumb: 'Notifications' } satisfies AppRouteData,
        loadComponent: () =>
          import('@features/notifications/pages/notifications-page/notifications-page').then(
            (m) => m.NotificationsPage,
          ),
      },

      /* Static content pages linked from the footer. */
      ...INFO_ROUTES,

      /*
       * Design system reference, development builds only.
       *
       * Gated on a bundler-substituted literal rather than an `environment` lookup:
       * with a literal `false` the whole branch is dead code, so the showcase and the
       * component library it pulls in are eliminated instead of shipping as an
       * unreachable chunk.
       */
      ...(ngDevDesignSystem
        ? [
            {
              path: 'design-system',
              title: 'Design system',
              data: { breadcrumb: 'Design system' } satisfies AppRouteData,
              loadComponent: () =>
                import('@features/design-system/design-system').then((m) => m.DesignSystem),
            },
          ]
        : []),

      {
        path: '**',
        title: 'Page not found',
        loadComponent: () => import('@features/not-found/not-found').then((m) => m.NotFound),
      },
    ],
  },
];
