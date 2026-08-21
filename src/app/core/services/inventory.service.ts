import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';

import type { InventoryListQuery, InventoryRecord, Page } from '@core/models';

import { ApiClient } from './api-client';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly api = inject(ApiClient);

  /** `GET /inventory` — scarcest stock first, since the list exists to drive reordering. */
  list(query: InventoryListQuery = {}): Observable<Page<InventoryRecord>> {
    return this.api.get<Page<InventoryRecord>>('/inventory', {
      page: query.page,
      pageSize: query.pageSize,
      q: query.q,
      warehouseCode: query.warehouseCode,
      lowStockOnly: query.lowStockOnly,
    });
  }

  /** `GET /inventory/:productId`. 404 when a product has no stock record at all. */
  get(productId: string): Observable<InventoryRecord> {
    return this.api.get<InventoryRecord>(`/inventory/${encodeURIComponent(productId)}`);
  }
}
