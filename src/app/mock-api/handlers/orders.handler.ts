import type { OrderStatus } from '@core/models';
import type { OrderSeed } from '@mock-data/index';

import type { MockApiConfig } from '../mock-api.config';
import { type MockRoute, notFound, ok } from '../mock-api.types';
import { matchesText, paginate, readPaging, sortBy } from '../mock-api.utils';
import { allOrderSeeds, findOrderSeed, toOrder, toOrderSummary } from '../mock-db';

export function createOrderRoutes(config: MockApiConfig): readonly MockRoute[] {
  return [
    {
      method: 'GET',
      path: '/orders',
      handle: ({ query }) => {
        const { page, pageSize } = readPaging(query, config.defaultPageSize, config.maxPageSize);

        let orders: readonly OrderSeed[] = allOrderSeeds();

        const status = query['status'] as OrderStatus | undefined;
        if (status) {
          orders = orders.filter((order) => order.status === status);
        }

        const userId = query['userId'];
        if (userId) {
          orders = orders.filter((order) => order.userId === userId);
        }

        const term = query['q'];
        if (term) {
          orders = orders.filter((order) => matchesText([order.reference, order.id], term));
        }

        // Most recent first: an order list is read newest-down, not oldest-down.
        const ordered = sortBy(orders, (order) => Date.parse(order.placedAt), 'desc');

        return ok(paginate(ordered.map(toOrderSummary), page, pageSize));
      },
    },

    {
      method: 'GET',
      path: '/orders/:idOrReference',
      handle: ({ params }) => {
        const idOrReference = params['idOrReference'] ?? '';
        const seed = findOrderSeed(idOrReference);

        if (!seed) {
          throw notFound(`No order matches "${idOrReference}".`);
        }

        return ok(toOrder(seed));
      },
    },
  ];
}
