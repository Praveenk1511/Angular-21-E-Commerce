import type { Coupon, CouponStatus, CouponValidationResult } from '@core/models';
import { COUPON_SEEDS } from '@mock-data/index';

import { type MockRoute, badRequest, conflict, notFound, ok } from '../mock-api.types';
import { roundMinor } from '../mock-api.utils';

const PERCENT_DIVISOR = 100;

/**
 * Coupon endpoints.
 *
 * The validation endpoint is the clearest place in the mock to demonstrate meaningful
 * error responses. Each rejection carries its own machine-readable code so a checkout
 * can explain *why* a code failed, rather than showing one generic message for five
 * different situations:
 *
 * - unknown code                  404 COUPON_NOT_FOUND
 * - not started yet               409 COUPON_NOT_STARTED
 * - expired                       409 COUPON_EXPIRED
 * - usage limit reached           409 COUPON_EXHAUSTED
 * - withdrawn                     409 COUPON_DISABLED
 * - basket below minimum spend    409 COUPON_MINIMUM_SPEND
 * - basket has no eligible items  409 COUPON_NOT_APPLICABLE
 */
export function createCouponRoutes(): readonly MockRoute[] {
  return [
    {
      method: 'GET',
      path: '/coupons',
      handle: () => ok(COUPON_SEEDS.map((coupon) => ({ ...coupon, status: deriveStatus(coupon) }))),
    },

    {
      method: 'POST',
      path: '/coupons/validate',
      handle: ({ body }) => {
        const payload = (body ?? {}) as Record<string, unknown>;
        const code = String(payload['code'] ?? '')
          .trim()
          .toUpperCase();
        const subtotalMinor = Number(payload['subtotalMinor']);

        if (code === '') {
          throw badRequest('Enter a discount code.');
        }

        if (!Number.isFinite(subtotalMinor) || subtotalMinor < 0) {
          throw badRequest('A valid basket subtotal is required.');
        }

        const coupon = COUPON_SEEDS.find((candidate) => candidate.code === code);

        if (!coupon) {
          throw notFound(`"${code}" is not a recognised discount code.`);
        }

        const status = deriveStatus(coupon);
        assertUsable(coupon, status);

        if (subtotalMinor < coupon.minimumSpendMinor) {
          throw conflict(
            'COUPON_MINIMUM_SPEND',
            `"${code}" needs a basket of at least ${formatMinor(coupon.minimumSpendMinor)}.`,
          );
        }

        const categoryIds = Array.isArray(payload['categoryIds'])
          ? (payload['categoryIds'] as readonly unknown[]).map(String)
          : [];

        if (
          coupon.appliesToCategoryIds.length > 0 &&
          !categoryIds.some((id) => coupon.appliesToCategoryIds.includes(id))
        ) {
          throw conflict(
            'COUPON_NOT_APPLICABLE',
            `"${code}" only applies to selected categories, and your basket has none of them.`,
          );
        }

        const result: CouponValidationResult = {
          coupon: { ...coupon, status },
          discountMinor: discountFor(coupon, subtotalMinor),
          freeShipping: coupon.kind === 'free-shipping',
        };

        return ok(result);
      },
    },
  ];
}

/**
 * Recompute status from the dates and usage count.
 *
 * The seed carries a status too, but deriving it means a fixture whose dates contradict
 * its own label cannot cause the validation endpoint to accept an expired code.
 */
function deriveStatus(coupon: Coupon): CouponStatus {
  if (coupon.status === 'disabled') {
    return 'disabled';
  }

  const now = Date.now();

  if (Date.parse(coupon.startsAt) > now) {
    return 'scheduled';
  }

  if (coupon.endsAt !== null && Date.parse(coupon.endsAt) < now) {
    return 'expired';
  }

  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
    return 'exhausted';
  }

  return 'active';
}

function assertUsable(coupon: Coupon, status: CouponStatus): void {
  switch (status) {
    case 'scheduled':
      throw conflict(
        'COUPON_NOT_STARTED',
        `"${coupon.code}" cannot be used until ${formatDate(coupon.startsAt)}.`,
      );
    case 'expired':
      throw conflict('COUPON_EXPIRED', `"${coupon.code}" expired and is no longer valid.`);
    case 'exhausted':
      throw conflict('COUPON_EXHAUSTED', `"${coupon.code}" has reached its usage limit.`);
    case 'disabled':
      throw conflict('COUPON_DISABLED', `"${coupon.code}" is no longer available.`);
    default:
      return;
  }
}

function discountFor(coupon: Coupon, subtotalMinor: number): number {
  if (coupon.kind === 'free-shipping') {
    return 0;
  }

  const raw =
    coupon.kind === 'percentage'
      ? roundMinor((subtotalMinor * coupon.value) / PERCENT_DIVISOR)
      : coupon.value;

  const capped =
    coupon.maximumDiscountMinor === null ? raw : Math.min(raw, coupon.maximumDiscountMinor);

  // A discount can never exceed the basket: a negative order total is not a discount.
  return Math.min(capped, subtotalMinor);
}

function formatMinor(minor: number): string {
  return `£${(minor / 100).toFixed(2)}`;
}

function formatDate(iso: string): string {
  return iso.slice(0, 10);
}
