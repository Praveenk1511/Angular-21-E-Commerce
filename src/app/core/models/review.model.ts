import type { RatingSummary } from './product.model';

export interface Review {
  readonly id: string;
  readonly productId: string;
  readonly authorName: string;
  /** Whether the reviewer's purchase of this product could be confirmed. */
  readonly verifiedPurchase: boolean;
  /** Whole stars, 1 to 5. */
  readonly score: number;
  readonly title: string;
  readonly body: string;
  /** ISO 8601. */
  readonly createdAt: string;
  readonly helpfulCount: number;
}

export type ReviewSortField = 'newest' | 'highest' | 'lowest' | 'helpful';

export interface ReviewListQuery {
  readonly page?: number;
  readonly pageSize?: number;
  /** Restrict to a single star score. */
  readonly score?: number;
  readonly sort?: ReviewSortField;
}

/** Payload for submitting a review. */
export interface NewReview {
  readonly authorName: string;
  readonly score: number;
  readonly title: string;
  readonly body: string;
}

/** Review list responses carry the aggregate so a summary panel needs no second call. */
export interface ReviewSummaryResponse {
  readonly summary: RatingSummary;
}
