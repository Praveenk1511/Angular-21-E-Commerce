/**
 * Route vocabulary for the whole application.
 *
 * `SEGMENTS` holds the individual path pieces used to *define* routes.
 * `APP_URLS` composes those pieces into absolute URLs used to *link* to routes.
 *
 * Everything reads from the same segments, so a navigation link cannot point at a
 * path that is not registered, and renaming a segment is a single edit.
 */
export const SEGMENTS = {
  // Storefront
  home: 'home',
  products: 'products',
  category: 'category',
  cart: 'cart',
  wishlist: 'wishlist',
  checkout: 'checkout',
  orders: 'orders',
  profile: 'profile',

  // Auth area
  auth: 'auth',
  login: 'login',
  register: 'register',
  forgotPassword: 'forgot-password',
  resetPassword: 'reset-password',

  // Admin area
  admin: 'admin',
  dashboard: 'dashboard',
  categories: 'categories',
  users: 'users',
  inventory: 'inventory',
  coupons: 'coupons',
  reports: 'reports',

  // Static information pages
  about: 'about',
  contact: 'contact',
  shippingReturns: 'shipping-returns',
  privacy: 'privacy',
  terms: 'terms',
} as const;

/**
 * Absolute URLs for linking.
 *
 * Parameterised routes are exposed as functions so callers cannot forget to
 * supply the parameter, and so the URL shape stays in one place.
 */
export const APP_URLS = {
  home: `/${SEGMENTS.home}`,
  products: `/${SEGMENTS.products}`,
  productDetail: (id: string): string => `/${SEGMENTS.products}/${id}`,
  categoryDetail: (slug: string): string => `/${SEGMENTS.category}/${slug}`,
  cart: `/${SEGMENTS.cart}`,
  wishlist: `/${SEGMENTS.wishlist}`,
  checkout: `/${SEGMENTS.checkout}`,
  orders: `/${SEGMENTS.orders}`,
  orderDetail: (id: string): string => `/${SEGMENTS.orders}/${id}`,
  profile: `/${SEGMENTS.profile}`,

  auth: {
    login: `/${SEGMENTS.auth}/${SEGMENTS.login}`,
    register: `/${SEGMENTS.auth}/${SEGMENTS.register}`,
    forgotPassword: `/${SEGMENTS.auth}/${SEGMENTS.forgotPassword}`,
    resetPassword: `/${SEGMENTS.auth}/${SEGMENTS.resetPassword}`,
  },

  admin: {
    dashboard: `/${SEGMENTS.admin}/${SEGMENTS.dashboard}`,
    products: `/${SEGMENTS.admin}/${SEGMENTS.products}`,
    categories: `/${SEGMENTS.admin}/${SEGMENTS.categories}`,
    orders: `/${SEGMENTS.admin}/${SEGMENTS.orders}`,
    users: `/${SEGMENTS.admin}/${SEGMENTS.users}`,
    inventory: `/${SEGMENTS.admin}/${SEGMENTS.inventory}`,
    coupons: `/${SEGMENTS.admin}/${SEGMENTS.coupons}`,
    reports: `/${SEGMENTS.admin}/${SEGMENTS.reports}`,
  },

  info: {
    about: `/${SEGMENTS.about}`,
    contact: `/${SEGMENTS.contact}`,
    shippingReturns: `/${SEGMENTS.shippingReturns}`,
    privacy: `/${SEGMENTS.privacy}`,
    terms: `/${SEGMENTS.terms}`,
  },
} as const;
