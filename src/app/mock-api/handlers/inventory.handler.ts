import type { InventoryRecord } from '@core/models';

import type { MockApiConfig } from '../mock-api.config';
import { type MockRoute, notFound, ok } from '../mock-api.types';
import { matchesText, paginate, readBool, readPaging, sortBy } from '../mock-api.utils';
import { allInventoryRecords, findInventoryRecord } from '../mock-db';

export function createInventoryRoutes(config: MockApiConfig): readonly MockRoute[] {
  return [
    {
      method: 'GET',
      path: '/inventory',
      handle: ({ query }) => {
        const { page, pageSize } = readPaging(query, config.defaultPageSize, config.maxPageSize);

        let records: readonly InventoryRecord[] = allInventoryRecords();

        const warehouseCode = query['warehouseCode'];
        if (warehouseCode) {
          records = records.filter((record) => record.warehouseCode === warehouseCode);
        }

        const term = query['q'];
        if (term) {
          records = records.filter((record) => matchesText([record.productName, record.sku], term));
        }

        if (readBool(query['lowStockOnly']) === true) {
          records = records.filter((record) => record.available <= record.reorderLevel);
        }

        // Scarcest first: this list exists to decide what to reorder.
        const ordered = sortBy(records, (record) => record.available, 'asc');

        return ok(paginate(ordered, page, pageSize));
      },
    },

    {
      method: 'GET',
      path: '/inventory/:productId',
      handle: ({ params }) => {
        const productId = params['productId'] ?? '';
        const record = findInventoryRecord(productId);

        if (!record) {
          throw notFound(`No inventory record exists for product "${productId}".`);
        }

        return ok(record);
      },
    },
  ];
}
