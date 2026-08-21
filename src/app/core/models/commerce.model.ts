import type { CurrencyCode } from './product.model';

export type CouponKind = 'percentage' | 'fixed' | 'free-shipping';

export type CouponStatus = 'active' | 'scheduled' | 'expired' | 'exhausted' | 'disabled';

export interface Coupon {
  readonly id: string;
  /** Uppercase, as the customer types it. */
  readonly code: string;
  readonly kind: CouponKind;
  readonly description: string;
  /** Percentage points for `percentage`, minor units for `fixed`, ignored otherwise. */
  readonly value: number;
  readonly currency: CurrencyCode;
  /** Order subtotal below which the coupon does not apply. */
  readonly minimumSpendMinor: number;
  /** Cap on the discount for percentage coupons, or `null` for uncapped. */
  readonly maximumDiscountMinor: number | null;
  readonly startsAt: string;
  /** ISO 8601, or `null` for a coupon that never expires. */
  readonly endsAt: string | null;
  readonly usageLimit: number | null;
  readonly usageCount: number;
  readonly status: CouponStatus;
  /** Empty means the coupon applies to the whole catalogue. */
  readonly appliesToCategoryIds: readonly string[];
}

/** Request body for checking a code against a basket. */
export interface CouponValidationRequest {
  readonly code: string;
  readonly subtotalMinor: number;
  readonly categoryIds?: readonly string[];
}

/** Successful validation: the coupon plus what it is worth for this basket. */
export interface CouponValidationResult {
  readonly coupon: Coupon;
  readonly discountMinor: number;
  readonly freeShipping: boolean;
}
