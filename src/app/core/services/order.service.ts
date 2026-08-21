import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';

import type { Order, OrderListQuery, OrderSummary, Page } from '@core/models';

import { ApiClient } from './api-client';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly api = inject(ApiClient);

  /** `GET /orders` — newest first, filterable by status and customer. */
  list(query: OrderListQuery = {}): Observable<Page<OrderSummary>> {
    return this.api.get<Page<OrderSummary>>('/orders', {
      page: query.page,
      pageSize: query.pageSize,
      status: query.status,
      userId: query.userId,
      q: query.q,
    });
  }

  /** `GET /orders/:idOrReference`. Accepts either the id or the customer reference. */
  get(idOrReference: string): Observable<Order> {
    return this.api.get<Order>(`/orders/${encodeURIComponent(idOrReference)}`);
  }
}
