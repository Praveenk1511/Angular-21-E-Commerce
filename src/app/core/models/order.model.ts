import type { Address } from './user.model';
import type { CurrencyCode, Price } from './product.model';

/**
 * Fulfilment state.
 *
 * `pending` covers an order placed but not yet paid; `on-hold` is a manual stop for
 * fraud or stock checks; `refunded` is distinct from `cancelled` because money moved.
 */
export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'on-hold'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
  | 'returned';

export type PaymentStatus = 'unpaid' | 'authorised' | 'paid' | 'partially-refunded' | 'refunded';

export type PaymentMethodKind = 'card' | 'paypal' | 'bank-transfer' | 'gift-card';

export interface PaymentDetails {
  readonly kind: PaymentMethodKind;
  readonly status: PaymentStatus;
  /** Last four digits for cards, masked account for others. Never a full number. */
  readonly maskedIdentifier: string | null;
  readonly brand: string | null;
}

export type ShippingMethodKind = 'standard' | 'express' | 'next-day' | 'collection';

export interface ShippingDetails {
  readonly method: ShippingMethodKind;
  readonly carrier: string | null;
  readonly trackingNumber: string | null;
  /** ISO 8601 date, or `null` before dispatch is scheduled. */
  readonly estimatedDeliveryAt: string | null;
  readonly shippedAt: string | null;
  readonly deliveredAt: string | null;
}

/**
 * A single purchased line.
 *
 * Name, SKU and unit price are copied onto the line rather than referenced, because
 * an order is a historical record: renaming or repricing a product must not rewrite
 * what a customer was charged last month.
 */
export interface OrderLine {
  readonly id: string;
  readonly productId: string;
  readonly productName: string;
  readonly productSlug: string;
  readonly sku: string;
  readonly quantity: number;
  readonly unitPrice: Price;
  readonly lineTotalMinor: number;
}

/** Money breakdown for an order. All values in the order's currency. */
export interface OrderTotals {
  readonly currency: CurrencyCode;
  readonly subtotalMinor: number;
  readonly discountMinor: number;
  readonly shippingMinor: number;
  readonly taxMinor: number;
  readonly grandTotalMinor: number;
}

/** One step in the order's audit trail. */
export interface OrderEvent {
  readonly status: OrderStatus;
  readonly at: string;
  readonly note: string | null;
}

/** Order shape for list views. */
export interface OrderSummary {
  readonly id: string;
  /** Customer-facing reference, as printed on the invoice. */
  readonly reference: string;
  readonly userId: string;
  readonly status: OrderStatus;
  readonly placedAt: string;
  readonly itemCount: number;
  readonly totals: OrderTotals;
}

export interface Order extends OrderSummary {
  readonly lines: readonly OrderLine[];
  readonly shippingAddress: Address;
  readonly billingAddress: Address;
  readonly payment: PaymentDetails;
  readonly shipping: ShippingDetails;
  readonly couponCode: string | null;
  readonly customerNote: string | null;
  readonly timeline: readonly OrderEvent[];
}

export interface OrderListQuery {
  readonly page?: number;
  readonly pageSize?: number;
  readonly status?: OrderStatus;
  readonly userId?: string;
  /** Matches the order reference. */
  readonly q?: string;
}
