import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';

import type { Product, ProductListQuery, ProductListResponse, ProductSummary } from '@core/models';

import { ApiClient, type ApiQuery } from './api-client';

/**
 * Catalogue data access.
 *
 * Real HTTP, against real URLs. Nothing in this file knows that a mock backend is
 * currently answering — which is the point: when a live REST API replaces it, this
 * service is already finished.
 *
 * No caching, no state, no signals. It returns cold observables and holds nothing. Which
 * results are kept, for how long, and how loading is represented are decisions for the
 * store layer, and burying them here would make them impossible to change per feature.
 */
@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly api = inject(ApiClient);

  /** `GET /products` — paged, filtered and sorted, with facet counts. */
  list(query: ProductListQuery = {}): Observable<ProductListResponse> {
    return this.api.get<ProductListResponse>('/products', toQuery(query));
  }

  /** `GET /products/:idOrSlug`. Fails with a 404 `ApiRequestError` if unknown. */
  getByIdOrSlug(idOrSlug: string): Observable<Product> {
    return this.api.get<Product>(`/products/${encodeURIComponent(idOrSlug)}`);
  }

  /** `GET /products/:idOrSlug/related`. */
  getRelated(idOrSlug: string): Observable<readonly ProductSummary[]> {
    return this.api.get<readonly ProductSummary[]>(
      `/products/${encodeURIComponent(idOrSlug)}/related`,
    );
  }
}

/**
 * Map the typed query onto wire parameters.
 *
 * Written out rather than spreading the object, so the HTTP contract is visible and a
 * rename in the model cannot silently change the query string.
 */
function toQuery(query: ProductListQuery): ApiQuery {
  return {
    page: query.page,
    pageSize: query.pageSize,
    q: query.q,
    categoryId: query.categoryId,
    brandIds: query.brandIds,
    minPriceMinor: query.minPriceMinor,
    maxPriceMinor: query.maxPriceMinor,
    minRating: query.minRating,
    inStockOnly: query.inStockOnly,
    tags: query.tags,
    sort: query.sort,
    direction: query.direction,
  };
}
