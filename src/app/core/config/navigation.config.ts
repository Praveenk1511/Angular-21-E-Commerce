import type { HeaderAction, NavigationGroup, NavigationItem } from '@core/models';

import { APP_URLS } from './route-paths';

/**
 * Shell navigation structure.
 *
 * Kept as configuration rather than markup so layout components stay purely
 * presentational and the information architecture is reviewable in one file.
 * When the catalog makes navigation data-driven, a store replaces these constants
 * and the components keep their existing inputs.
 */

/** Primary storefront navigation: header nav bar and mobile menu. */
export const PRIMARY_NAVIGATION: readonly NavigationItem[] = [
  { id: 'home', label: 'Home', url: APP_URLS.home, exact: true },
  { id: 'products', label: 'Shop', url: APP_URLS.products },
  { id: 'orders', label: 'Orders', url: APP_URLS.orders },
];

/** Icon shortcuts in the header utility area. */
export const HEADER_ACTIONS: readonly HeaderAction[] = [
  {
    id: 'login',
    label: 'Sign in',
    url: APP_URLS.auth.login,
    icon: 'user',
    showLabelOnDesktop: true,
  },
  { id: 'wishlist', label: 'Wishlist', url: APP_URLS.wishlist, icon: 'heart' },
  { id: 'cart', label: 'Cart', url: APP_URLS.cart, icon: 'cart' },
];

/** Footer link columns. */
export const FOOTER_NAVIGATION: readonly NavigationGroup[] = [
  {
    id: 'shop',
    heading: 'Shop',
    items: [
      { id: 'products', label: 'All products', url: APP_URLS.products },
      { id: 'wishlist', label: 'Wishlist', url: APP_URLS.wishlist },
      { id: 'cart', label: 'Your cart', url: APP_URLS.cart },
    ],
  },
  {
    id: 'account',
    heading: 'Account',
    items: [
      { id: 'login', label: 'Sign in', url: APP_URLS.auth.login },
      { id: 'register', label: 'Create account', url: APP_URLS.auth.register },
      { id: 'orders', label: 'Your orders', url: APP_URLS.orders },
      { id: 'profile', label: 'Your profile', url: APP_URLS.profile },
    ],
  },
  {
    id: 'support',
    heading: 'Support',
    items: [
      { id: 'contact', label: 'Contact us', url: APP_URLS.info.contact },
      { id: 'shipping-returns', label: 'Shipping & returns', url: APP_URLS.info.shippingReturns },
      { id: 'about', label: 'About us', url: APP_URLS.info.about },
    ],
  },
  {
    id: 'legal',
    heading: 'Legal',
    items: [
      { id: 'privacy', label: 'Privacy policy', url: APP_URLS.info.privacy },
      { id: 'terms', label: 'Terms of service', url: APP_URLS.info.terms },
    ],
  },
];

/** Admin sidebar navigation. */
export const ADMIN_NAVIGATION: readonly NavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', url: APP_URLS.admin.dashboard },
  { id: 'products', label: 'Products', url: APP_URLS.admin.products },
  { id: 'categories', label: 'Categories', url: APP_URLS.admin.categories },
  { id: 'orders', label: 'Orders', url: APP_URLS.admin.orders },
  { id: 'users', label: 'Users', url: APP_URLS.admin.users },
  { id: 'inventory', label: 'Inventory', url: APP_URLS.admin.inventory },
  { id: 'coupons', label: 'Coupons', url: APP_URLS.admin.coupons },
  { id: 'reports', label: 'Reports', url: APP_URLS.admin.reports },
];

/** Auth area cross-links, rendered by the auth layout. */
export const AUTH_NAVIGATION: readonly NavigationItem[] = [
  { id: 'login', label: 'Sign in', url: APP_URLS.auth.login },
  { id: 'register', label: 'Create account', url: APP_URLS.auth.register },
  { id: 'forgot-password', label: 'Forgot password', url: APP_URLS.auth.forgotPassword },
];
