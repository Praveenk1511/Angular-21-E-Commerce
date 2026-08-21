import type { MockApiConfig } from '../mock-api.config';
import type { MockRoute } from '../mock-api.types';

import { createAuthRoutes } from './auth.handler';
import { createCatalogRoutes } from './catalog.handler';
import { createCouponRoutes } from './coupons.handler';
import { createDashboardRoutes } from './dashboard.handler';
import { createInventoryRoutes } from './inventory.handler';
import { createNotificationRoutes } from './notifications.handler';
import { createOrderRoutes } from './orders.handler';
import { createProductRoutes } from './products.handler';
import { createReviewRoutes } from './reviews.handler';
import { createUserRoutes } from './users.handler';

/**
 * The complete fake REST surface.
 *
 * ORDER MATTERS, exactly as it does in a real router: more specific paths must be
 * registered before the patterns that would otherwise swallow them. Reviews are listed
 * before the generic product routes so `/products/:id/reviews` is not matched as a
 * product whose id happens to be `:id/reviews`.
 */
export function createMockRoutes(config: MockApiConfig): readonly MockRoute[] {
  return [
    ...createAuthRoutes(),
    ...createReviewRoutes(config),
    ...createProductRoutes(config),
    ...createCatalogRoutes(),
    ...createUserRoutes(config),
    ...createOrderRoutes(config),
    ...createCouponRoutes(),
    ...createNotificationRoutes(config),
    ...createInventoryRoutes(config),
    ...createDashboardRoutes(),
  ];
}
