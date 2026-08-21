import type { ApiFieldError, Page, RatingSummary, Review, ReviewSortField } from '@core/models';
import { REVIEW_SEEDS } from '@mock-data/index';

import type { MockApiConfig } from '../mock-api.config';
import { type MockRoute, created, notFound, ok, unprocessable } from '../mock-api.types';
import { paginate, readInt, readPaging, sortBy } from '../mock-api.utils';
import { findProductSeed, ratingFor } from '../mock-db';

/**
 * Reviews submitted during this session.
 *
 * Held in module state rather than written back into the seed file: a POST should be
 * observable by a following GET, which is what makes an optimistic UI testable, but it
 * must not survive a reload or the fixture would drift with use.
 */
const submitted: Review[] = [];

const MIN_TITLE_LENGTH = 3;
const MIN_BODY_LENGTH = 20;
const MAX_BODY_LENGTH = 2000;

interface ReviewListResponse extends Page<Review> {
  readonly summary: RatingSummary;
}

export function createReviewRoutes(config: MockApiConfig): readonly MockRoute[] {
  return [
    {
      method: 'GET',
      path: '/products/:idOrSlug/reviews',
      handle: ({ params, query }) => {
        const seed = requireProduct(params['idOrSlug'] ?? '');
        const { page, pageSize } = readPaging(query, config.defaultPageSize, config.maxPageSize);

        let reviews = reviewsFor(seed.id);

        const score = readInt(query['score']);
        if (score !== undefined) {
          reviews = reviews.filter((review) => review.score === score);
        }

        const ordered = applySort(reviews, readSort(query['sort']));

        const response: ReviewListResponse = {
          ...paginate(ordered, page, pageSize),
          // The aggregate stays whole-catalogue, not filtered: a score filter narrows
          // the list a reader sees, it does not change the product's actual rating.
          summary: ratingFor(seed),
        };

        return ok(response);
      },
    },

    {
      method: 'POST',
      path: '/products/:idOrSlug/reviews',
      handle: ({ params, body }) => {
        const seed = requireProduct(params['idOrSlug'] ?? '');
        const payload = (body ?? {}) as Record<string, unknown>;
        const fieldErrors = validate(payload);

        if (fieldErrors.length > 0) {
          throw unprocessable('The review could not be saved.', fieldErrors);
        }

        const review: Review = {
          id: `rev-new-${submitted.length + 1}`,
          productId: seed.id,
          authorName: String(payload['authorName']).trim(),
          // Cannot be verified without an authenticated purchase history.
          verifiedPurchase: false,
          score: Number(payload['score']),
          title: String(payload['title']).trim(),
          body: String(payload['body']).trim(),
          createdAt: new Date().toISOString(),
          helpfulCount: 0,
        };

        submitted.push(review);

        return created(review);
      },
    },
  ];
}

function requireProduct(idOrSlug: string) {
  const seed = findProductSeed(idOrSlug);

  if (!seed) {
    throw notFound(`No product matches "${idOrSlug}".`);
  }

  return seed;
}

function reviewsFor(productId: string): readonly Review[] {
  return [...REVIEW_SEEDS, ...submitted].filter((review) => review.productId === productId);
}

function readSort(value: string | undefined): ReviewSortField {
  const allowed: readonly ReviewSortField[] = ['newest', 'highest', 'lowest', 'helpful'];

  return allowed.find((field) => field === value) ?? 'newest';
}

function applySort(reviews: readonly Review[], sort: ReviewSortField): readonly Review[] {
  switch (sort) {
    case 'highest':
      return sortBy(reviews, (review) => review.score, 'desc');
    case 'lowest':
      return sortBy(reviews, (review) => review.score, 'asc');
    case 'helpful':
      return sortBy(reviews, (review) => review.helpfulCount, 'desc');
    case 'newest':
    default:
      return sortBy(reviews, (review) => Date.parse(review.createdAt), 'desc');
  }
}

/**
 * Validate a submitted review.
 *
 * Every problem is collected rather than returning on the first, so a form can show all
 * of its errors at once instead of making the user resubmit to find the next one.
 */
function validate(payload: Record<string, unknown>): readonly ApiFieldError[] {
  const errors: ApiFieldError[] = [];
  const authorName = String(payload['authorName'] ?? '').trim();
  const title = String(payload['title'] ?? '').trim();
  const body = String(payload['body'] ?? '').trim();
  const score = Number(payload['score']);

  if (authorName.length === 0) {
    errors.push({ field: 'authorName', message: 'Enter the name to display with your review.' });
  }

  if (!Number.isInteger(score) || score < 1 || score > 5) {
    errors.push({ field: 'score', message: 'Choose a rating between 1 and 5 stars.' });
  }

  if (title.length < MIN_TITLE_LENGTH) {
    errors.push({
      field: 'title',
      message: `Give your review a title of at least ${MIN_TITLE_LENGTH} characters.`,
    });
  }

  if (body.length < MIN_BODY_LENGTH) {
    errors.push({
      field: 'body',
      message: `Write at least ${MIN_BODY_LENGTH} characters so the review is useful.`,
    });
  }

  if (body.length > MAX_BODY_LENGTH) {
    errors.push({
      field: 'body',
      message: `Keep your review under ${MAX_BODY_LENGTH} characters.`,
    });
  }

  return errors;
}
