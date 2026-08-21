import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';

import type { NewReview, Page, RatingSummary, Review, ReviewListQuery } from '@core/models';

import { ApiClient } from './api-client';

/** Review list response: a page of reviews plus the product's overall aggregate. */
export interface ReviewListResult extends Page<Review> {
  readonly summary: RatingSummary;
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly api = inject(ApiClient);

  /** `GET /products/:idOrSlug/reviews`. */
  list(productIdOrSlug: string, query: ReviewListQuery = {}): Observable<ReviewListResult> {
    return this.api.get<ReviewListResult>(
      `/products/${encodeURIComponent(productIdOrSlug)}/reviews`,
      {
        page: query.page,
        pageSize: query.pageSize,
        score: query.score,
        sort: query.sort,
      },
    );
  }

  /**
   * `POST /products/:idOrSlug/reviews`.
   *
   * Rejects with a 422 `ApiRequestError` carrying `fieldErrors`, which a reactive form
   * can map straight onto its controls.
   */
  submit(productIdOrSlug: string, review: NewReview): Observable<Review> {
    return this.api.post<Review>(
      `/products/${encodeURIComponent(productIdOrSlug)}/reviews`,
      review,
    );
  }
}
