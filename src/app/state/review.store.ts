import { Injectable, inject, signal } from '@angular/core';

import type { NewReview, RatingSummary, Review, ReviewSortField } from '@core/models';
import { AuthStore } from '@state/auth.store';
import { OrdersStore } from '@state/orders.store';

const REVIEWS_STORAGE_KEY = 'lumen_product_reviews';
const HELPFUL_VOTES_KEY = 'lumen_review_helpful_votes';

const MOCK_INITIAL_REVIEWS: readonly Review[] = [
  {
    id: 'rev-101',
    productId: 'prod-1',
    authorName: 'Sarah Jenkins',
    verifiedPurchase: true,
    score: 5,
    title: 'Outstanding build quality and lumbar support!',
    body: 'I spend 8+ hours a day at my desk and this ergonomic chair completely eliminated my lower back pain. Highly recommended for remote workers!',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    helpfulCount: 14,
  },
  {
    id: 'rev-102',
    productId: 'prod-1',
    authorName: 'Marcus Vance',
    verifiedPurchase: true,
    score: 4,
    title: 'Great desk chair, easy 15-min assembly',
    body: 'Solid materials and clean aesthetic. The armrests are 3D adjustable which is a nice touch. Cushioning is slightly firm but very supportive.',
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    helpfulCount: 6,
  },
  {
    id: 'rev-103',
    productId: 'prod-1',
    authorName: 'David K.',
    verifiedPurchase: true,
    score: 5,
    title: 'Ergonomic support is top tier!',
    body: 'Smooth casters, breathable mesh back, and sturdy frame. Premium product experience from unboxing to daily use.',
    createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    helpfulCount: 3,
  },
  {
    id: 'rev-201',
    productId: 'prod-2',
    authorName: 'Elena Rostova',
    verifiedPurchase: true,
    score: 5,
    title: 'Super precise sensor and long battery life',
    body: 'Tracks flawlessly on glass and wood surfaces alike. The USB-C fast charging gives weeks of use on a single charge.',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    helpfulCount: 8,
  },
  {
    id: 'rev-202',
    productId: 'prod-2',
    authorName: 'Tom H.',
    verifiedPurchase: true,
    score: 4,
    title: 'Good ergonomics, whisper-quiet clicks',
    body: 'Fits comfortably in medium to large hands. Silent click switches are awesome for shared office spaces.',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    helpfulCount: 2,
  },
  {
    id: 'rev-301',
    productId: 'prod-3',
    authorName: 'Alex Morgan',
    verifiedPurchase: true,
    score: 5,
    title: 'Best active noise cancellation in this class',
    body: 'Blocks out plane engine rumble and office chatter effortlessly. Sound profile is rich with crisp highs and deep bass.',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    helpfulCount: 21,
  },
  {
    id: 'rev-302',
    productId: 'prod-3',
    authorName: 'Claire Bennett',
    verifiedPurchase: true,
    score: 5,
    title: 'Sleek design and comfortable earcups',
    body: 'The memory foam cushions feel plush even after a full workday of Zoom calls. Bluetooth multi-point pairing works seamlessly.',
    createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    helpfulCount: 9,
  },
];

export interface DetailedRatingSummary extends RatingSummary {
  readonly countsMap: Record<number, number>;
  readonly percentages: Record<number, number>;
}

export interface ReviewStateQuery {
  readonly page: number;
  readonly pageSize: number;
  readonly sort: ReviewSortField;
  readonly scoreFilter: number | null;
}

/**
 * Root state manager for Product Reviews, Ratings Summary, Sorting, Pagination,
 * and Customer Review Submission & Helpful Voting.
 */
@Injectable({ providedIn: 'root' })
export class ReviewStore {
  private readonly authStore = inject(AuthStore);
  private readonly ordersStore = inject(OrdersStore);

  // ---------- Internal State ----------
  private readonly reviewsSignal = signal<readonly Review[]>([]);
  private readonly helpfulVotesSignal = signal<ReadonlySet<string>>(new Set());

  readonly activeSort = signal<ReviewSortField>('newest');
  readonly activePage = signal<number>(1);
  readonly pageSize = signal<number>(3);
  readonly scoreFilter = signal<number | null>(null);

  constructor() {
    this.readStoredReviews();
    this.readStoredHelpfulVotes();
  }

  // ---------- Actions & Queries ----------

  setSort(sort: ReviewSortField): void {
    this.activeSort.set(sort);
    this.activePage.set(1);
  }

  setPage(page: number): void {
    this.activePage.set(page);
  }

  setScoreFilter(score: number | null): void {
    const current = this.scoreFilter();
    this.scoreFilter.set(current === score ? null : score);
    this.activePage.set(1);
  }

  isHelpfulVoted(reviewId: string): boolean {
    return this.helpfulVotesSignal().has(reviewId);
  }

  /**
   * Checks whether the current signed-in user has purchased this product.
   */
  hasUserPurchasedProduct(productId: string): boolean {
    const orders = this.ordersStore.userOrders();
    return orders.some((ord) => ord.lines.some((line) => line.productId === productId));
  }

  /**
   * Checks whether a review belongs to the currently signed-in user.
   */
  isOwnReview(review: Review): boolean {
    const currentUser = this.authStore.currentUser();
    if (!currentUser) return false;

    const fullName = `${currentUser.firstName} ${currentUser.lastName}`.trim();
    return review.authorName.toLowerCase() === fullName.toLowerCase();
  }

  /**
   * Returns rating breakdown summary (average rating, count, distribution counts & percentages) for a product.
   */
  getRatingSummary(productId: string): DetailedRatingSummary {
    const allForProd = this.reviewsSignal().filter((r) => r.productId === productId);
    const totalCount = allForProd.length;

    const countsMap: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const percentages: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    if (totalCount === 0) {
      return {
        average: 0,
        count: 0,
        distribution: [0, 0, 0, 0, 0],
        countsMap,
        percentages,
      };
    }

    let sum = 0;
    for (const r of allForProd) {
      sum += r.score;
      const s = Math.min(5, Math.max(1, Math.round(r.score)));
      countsMap[s] = (countsMap[s] ?? 0) + 1;
    }

    const average = Math.round((sum / totalCount) * 10) / 10;

    for (let star = 1; star <= 5; star++) {
      percentages[star] = Math.round(((countsMap[star] ?? 0) / totalCount) * 100);
    }

    const distTuple: readonly [number, number, number, number, number] = [
      countsMap[1] ?? 0,
      countsMap[2] ?? 0,
      countsMap[3] ?? 0,
      countsMap[4] ?? 0,
      countsMap[5] ?? 0,
    ];

    return {
      average,
      count: totalCount,
      distribution: distTuple,
      countsMap,
      percentages,
    };
  }

  /**
   * Returns sorted and paginated reviews list for a product.
   */
  getPaginatedReviews(productId: string): {
    items: readonly Review[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  } {
    let list = this.reviewsSignal().filter((r) => r.productId === productId);

    const filter = this.scoreFilter();
    if (filter !== null) {
      list = list.filter((r) => r.score === filter);
    }

    const sort = this.activeSort();
    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'highest':
          return b.score - a.score;
        case 'lowest':
          return a.score - b.score;
        case 'helpful':
          return b.helpfulCount - a.helpfulCount;
        default:
          return 0;
      }
    });

    const totalCount = list.length;
    const size = this.pageSize();
    const totalPages = Math.max(1, Math.ceil(totalCount / size));
    const currentPage = Math.min(this.activePage(), totalPages);

    const startIndex = (currentPage - 1) * size;
    const items = list.slice(startIndex, startIndex + size);

    return {
      items,
      totalCount,
      totalPages,
      currentPage,
    };
  }

  // ---------- Mutation Actions ----------

  addReview(productId: string, newReview: NewReview): Review {
    const isPurchased = this.hasUserPurchasedProduct(productId);
    const currentUser = this.authStore.currentUser();

    const created: Review = {
      id: `rev-${Date.now()}`,
      productId,
      authorName: newReview.authorName || currentUser ? `${currentUser?.firstName} ${currentUser?.lastName}` : 'Anonymous Customer',
      verifiedPurchase: isPurchased,
      score: newReview.score,
      title: newReview.title,
      body: newReview.body,
      createdAt: new Date().toISOString(),
      helpfulCount: 0,
    };

    const updated = [created, ...this.reviewsSignal()];
    this.updateReviewsState(updated);

    return created;
  }

  updateReview(reviewId: string, updates: Partial<NewReview>): boolean {
    const list = [...this.reviewsSignal()];
    const idx = list.findIndex((r) => r.id === reviewId);
    if (idx === -1) return false;

    const existing = list[idx]!;
    list[idx] = {
      ...existing,
      score: updates.score ?? existing.score,
      title: updates.title ?? existing.title,
      body: updates.body ?? existing.body,
      authorName: updates.authorName ?? existing.authorName,
    };

    this.updateReviewsState(list);
    return true;
  }

  deleteReview(reviewId: string): boolean {
    const updated = this.reviewsSignal().filter((r) => r.id !== reviewId);
    this.updateReviewsState(updated);
    return true;
  }

  toggleHelpful(reviewId: string): void {
    const votedSet = new Set(this.helpfulVotesSignal());
    const isVoted = votedSet.has(reviewId);

    if (isVoted) {
      votedSet.delete(reviewId);
    } else {
      votedSet.add(reviewId);
    }

    this.helpfulVotesSignal.set(votedSet);
    this.persistHelpfulVotes(votedSet);

    const list = [...this.reviewsSignal()];
    const idx = list.findIndex((r) => r.id === reviewId);
    if (idx !== -1) {
      const target = list[idx]!;
      list[idx] = {
        ...target,
        helpfulCount: isVoted ? Math.max(0, target.helpfulCount - 1) : target.helpfulCount + 1,
      };
      this.updateReviewsState(list);
    }
  }

  // ---------- Internals ----------

  private updateReviewsState(list: readonly Review[]): void {
    this.reviewsSignal.set(list);
    this.persistReviews(list);
  }

  private readStoredReviews(): void {
    try {
      const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.reviewsSignal.set(parsed as Review[]);
          return;
        }
      }
    } catch {
      // Swallowed
    }

    this.reviewsSignal.set(MOCK_INITIAL_REVIEWS);
    this.persistReviews(MOCK_INITIAL_REVIEWS);
  }

  private persistReviews(list: readonly Review[]): void {
    try {
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(list));
    } catch {
      // Swallowed
    }
  }

  private readStoredHelpfulVotes(): void {
    try {
      const raw = localStorage.getItem(HELPFUL_VOTES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as string[];
        if (Array.isArray(parsed)) {
          this.helpfulVotesSignal.set(new Set(parsed));
        }
      }
    } catch {
      // Swallowed
    }
  }

  private persistHelpfulVotes(set: Set<string>): void {
    try {
      localStorage.setItem(HELPFUL_VOTES_KEY, JSON.stringify([...set]));
    } catch {
      // Swallowed
    }
  }
}
