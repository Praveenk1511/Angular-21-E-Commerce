/**
 * Seed data barrel.
 *
 * IMPORTANT: only the mock API may import from this folder.
 *
 * Components, stores and services must go through HTTP like they would against a real
 * backend. If a component imports a seed directly, deleting the mock API stops being a
 * one-line change and becomes a refactor — which is exactly the coupling this layer
 * exists to prevent.
 */
export * from './addresses.mock';
export * from './brands.mock';
export * from './categories.mock';
export * from './coupons.mock';
export * from './credentials.mock';
export * from './inventory.mock';
export * from './notifications.mock';
export * from './orders.mock';
export * from './products.mock';
export * from './reviews.mock';
export * from './users.mock';
