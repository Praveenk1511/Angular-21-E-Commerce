import type { OrderEvent, OrderStatus, PaymentDetails, ShippingDetails } from '@core/models';

/** A purchased line, referencing the catalogue rather than duplicating it. */
export interface OrderLineSeed {
  readonly productId: string;
  readonly quantity: number;
  /** Unit price actually charged, in pence. May differ from today's catalogue price. */
  readonly unitPriceMinor: number;
}

/**
 * Order seed records.
 *
 * Addresses are referenced by id and product details by product id: the mock API
 * resolves both, and computes every total. Hand-written totals in a fixture are
 * arithmetic waiting to be wrong, and a fixture whose sums do not add up teaches the
 * UI to distrust its own data.
 *
 * Unit prices *are* stored, because an order is a historical record — a later price
 * change must not rewrite what someone was charged.
 *
 * All eight order statuses appear at least once, so status-dependent UI can be built
 * without inventing states.
 */
export interface OrderSeed {
  readonly id: string;
  readonly reference: string;
  readonly userId: string;
  readonly status: OrderStatus;
  readonly placedAt: string;
  readonly lines: readonly OrderLineSeed[];
  readonly shippingAddressId: string;
  readonly billingAddressId: string;
  readonly payment: PaymentDetails;
  readonly shipping: ShippingDetails;
  readonly couponCode: string | null;
  /** Discount applied, in pence. */
  readonly discountMinor: number;
  /** Delivery charge, in pence. Zero for free delivery. */
  readonly shippingMinor: number;
  readonly customerNote: string | null;
  readonly timeline: readonly OrderEvent[];
}

export const ORDER_SEEDS: readonly OrderSeed[] = [
  // ---------- delivered ----------
  {
    id: 'ord-9001',
    reference: 'LUM-2026-9001',
    userId: 'usr-1001',
    status: 'delivered',
    placedAt: '2026-07-02T10:14:00.000Z',
    lines: [
      { productId: 'prd-0015', quantity: 1, unitPriceMinor: 129900 },
      { productId: 'prd-0046', quantity: 1, unitPriceMinor: 4900 },
    ],
    shippingAddressId: 'adr-0001',
    billingAddressId: 'adr-0002',
    payment: { kind: 'card', status: 'paid', maskedIdentifier: '4417', brand: 'Visa' },
    shipping: {
      method: 'next-day',
      carrier: 'Parcelforce',
      trackingNumber: 'PF884213907GB',
      estimatedDeliveryAt: '2026-07-03T00:00:00.000Z',
      shippedAt: '2026-07-02T17:40:00.000Z',
      deliveredAt: '2026-07-03T11:22:00.000Z',
    },
    couponCode: null,
    discountMinor: 0,
    shippingMinor: 995,
    customerNote: null,
    timeline: [
      { status: 'pending', at: '2026-07-02T10:14:00.000Z', note: 'Order placed' },
      { status: 'processing', at: '2026-07-02T10:16:00.000Z', note: 'Payment captured' },
      { status: 'shipped', at: '2026-07-02T17:40:00.000Z', note: 'Handed to Parcelforce' },
      { status: 'delivered', at: '2026-07-03T11:22:00.000Z', note: 'Signed for by H. Vance' },
    ],
  },
  {
    id: 'ord-9002',
    reference: 'LUM-2026-9002',
    userId: 'usr-1002',
    status: 'delivered',
    placedAt: '2026-06-18T15:02:00.000Z',
    lines: [
      { productId: 'prd-0007', quantity: 1, unitPriceMinor: 14900 },
      { productId: 'prd-0047', quantity: 2, unitPriceMinor: 1900 },
    ],
    shippingAddressId: 'adr-0004',
    billingAddressId: 'adr-0005',
    payment: { kind: 'paypal', status: 'paid', maskedIdentifier: 'd***n@example.com', brand: null },
    shipping: {
      method: 'standard',
      carrier: 'Royal Mail',
      trackingNumber: 'RM4471209883GB',
      estimatedDeliveryAt: '2026-06-23T00:00:00.000Z',
      shippedAt: '2026-06-19T09:12:00.000Z',
      deliveredAt: '2026-06-22T13:48:00.000Z',
    },
    couponCode: 'WELCOME10',
    discountMinor: 1870,
    shippingMinor: 0,
    customerNote: 'Please leave with a neighbour if out.',
    timeline: [
      { status: 'pending', at: '2026-06-18T15:02:00.000Z', note: 'Order placed' },
      { status: 'processing', at: '2026-06-18T15:03:00.000Z', note: 'Payment captured' },
      { status: 'shipped', at: '2026-06-19T09:12:00.000Z', note: null },
      { status: 'delivered', at: '2026-06-22T13:48:00.000Z', note: 'Left with neighbour at no. 9' },
    ],
  },
  {
    id: 'ord-9003',
    reference: 'LUM-2026-9003',
    userId: 'usr-1001',
    status: 'delivered',
    placedAt: '2026-05-11T08:36:00.000Z',
    lines: [{ productId: 'prd-0045', quantity: 1, unitPriceMinor: 12900 }],
    shippingAddressId: 'adr-0003',
    billingAddressId: 'adr-0002',
    payment: { kind: 'card', status: 'paid', maskedIdentifier: '4417', brand: 'Visa' },
    shipping: {
      method: 'standard',
      carrier: 'Royal Mail',
      trackingNumber: 'RM4471188214GB',
      estimatedDeliveryAt: '2026-05-16T00:00:00.000Z',
      shippedAt: '2026-05-12T10:05:00.000Z',
      deliveredAt: '2026-05-14T14:31:00.000Z',
    },
    couponCode: null,
    discountMinor: 0,
    shippingMinor: 0,
    customerNote: null,
    timeline: [
      { status: 'pending', at: '2026-05-11T08:36:00.000Z', note: 'Order placed' },
      { status: 'processing', at: '2026-05-11T08:38:00.000Z', note: 'Payment captured' },
      { status: 'shipped', at: '2026-05-12T10:05:00.000Z', note: null },
      { status: 'delivered', at: '2026-05-14T14:31:00.000Z', note: 'Received at reception' },
    ],
  },

  // ---------- shipped ----------
  {
    id: 'ord-9004',
    reference: 'LUM-2026-9004',
    userId: 'usr-1003',
    status: 'shipped',
    placedAt: '2026-08-17T19:41:00.000Z',
    lines: [
      { productId: 'prd-0038', quantity: 1, unitPriceMinor: 11900 },
      { productId: 'prd-0039', quantity: 1, unitPriceMinor: 18900 },
    ],
    shippingAddressId: 'adr-0006',
    billingAddressId: 'adr-0007',
    payment: { kind: 'card', status: 'paid', maskedIdentifier: '0092', brand: 'Mastercard' },
    shipping: {
      method: 'express',
      carrier: 'DPD',
      trackingNumber: 'DPD7719004412',
      estimatedDeliveryAt: '2026-08-22T00:00:00.000Z',
      shippedAt: '2026-08-19T08:20:00.000Z',
      deliveredAt: null,
    },
    couponCode: 'BREW15',
    discountMinor: 4620,
    shippingMinor: 495,
    customerNote: null,
    timeline: [
      { status: 'pending', at: '2026-08-17T19:41:00.000Z', note: 'Order placed' },
      { status: 'processing', at: '2026-08-18T07:02:00.000Z', note: 'Payment captured' },
      { status: 'shipped', at: '2026-08-19T08:20:00.000Z', note: 'Collected by DPD' },
    ],
  },
  {
    id: 'ord-9005',
    reference: 'LUM-2026-9005',
    userId: 'usr-1005',
    status: 'shipped',
    placedAt: '2026-08-16T12:28:00.000Z',
    lines: [{ productId: 'prd-0034', quantity: 1, unitPriceMinor: 24900 }],
    shippingAddressId: 'adr-0010',
    billingAddressId: 'adr-0011',
    payment: { kind: 'card', status: 'paid', maskedIdentifier: '7731', brand: 'Visa' },
    shipping: {
      method: 'standard',
      carrier: 'Royal Mail',
      trackingNumber: 'RM4471340977GB',
      estimatedDeliveryAt: '2026-08-21T00:00:00.000Z',
      shippedAt: '2026-08-17T11:15:00.000Z',
      deliveredAt: null,
    },
    couponCode: null,
    discountMinor: 0,
    shippingMinor: 0,
    customerNote: null,
    timeline: [
      { status: 'pending', at: '2026-08-16T12:28:00.000Z', note: 'Order placed' },
      { status: 'processing', at: '2026-08-16T12:30:00.000Z', note: 'Payment captured' },
      { status: 'shipped', at: '2026-08-17T11:15:00.000Z', note: null },
    ],
  },

  // ---------- processing ----------
  {
    id: 'ord-9006',
    reference: 'LUM-2026-9006',
    userId: 'usr-1002',
    status: 'processing',
    placedAt: '2026-08-20T21:07:00.000Z',
    lines: [
      { productId: 'prd-0023', quantity: 1, unitPriceMinor: 15900 },
      { productId: 'prd-0027', quantity: 1, unitPriceMinor: 3900 },
      { productId: 'prd-0026', quantity: 1, unitPriceMinor: 8900 },
    ],
    shippingAddressId: 'adr-0004',
    billingAddressId: 'adr-0005',
    payment: { kind: 'card', status: 'paid', maskedIdentifier: '5518', brand: 'Mastercard' },
    shipping: {
      method: 'standard',
      carrier: null,
      trackingNumber: null,
      estimatedDeliveryAt: '2026-08-26T00:00:00.000Z',
      shippedAt: null,
      deliveredAt: null,
    },
    couponCode: null,
    discountMinor: 0,
    shippingMinor: 0,
    customerNote: 'Gift — please omit the invoice from the parcel.',
    timeline: [
      { status: 'pending', at: '2026-08-20T21:07:00.000Z', note: 'Order placed' },
      { status: 'processing', at: '2026-08-20T21:09:00.000Z', note: 'Payment captured' },
    ],
  },
  {
    id: 'ord-9007',
    reference: 'LUM-2026-9007',
    userId: 'usr-1001',
    status: 'processing',
    placedAt: '2026-08-21T06:52:00.000Z',
    lines: [{ productId: 'prd-0019', quantity: 2, unitPriceMinor: 64900 }],
    shippingAddressId: 'adr-0001',
    billingAddressId: 'adr-0002',
    payment: { kind: 'card', status: 'paid', maskedIdentifier: '4417', brand: 'Visa' },
    shipping: {
      method: 'express',
      carrier: null,
      trackingNumber: null,
      estimatedDeliveryAt: '2026-08-25T00:00:00.000Z',
      shippedAt: null,
      deliveredAt: null,
    },
    couponCode: 'DESK25',
    discountMinor: 25000,
    shippingMinor: 0,
    customerNote: null,
    timeline: [
      { status: 'pending', at: '2026-08-21T06:52:00.000Z', note: 'Order placed' },
      { status: 'processing', at: '2026-08-21T06:54:00.000Z', note: 'Payment captured' },
    ],
  },

  // ---------- pending ----------
  {
    id: 'ord-9008',
    reference: 'LUM-2026-9008',
    userId: 'usr-1003',
    status: 'pending',
    placedAt: '2026-08-21T07:38:00.000Z',
    lines: [{ productId: 'prd-0018', quantity: 1, unitPriceMinor: 289900 }],
    shippingAddressId: 'adr-0006',
    billingAddressId: 'adr-0007',
    payment: {
      kind: 'bank-transfer',
      status: 'unpaid',
      maskedIdentifier: '****4471',
      brand: null,
    },
    shipping: {
      method: 'standard',
      carrier: null,
      trackingNumber: null,
      estimatedDeliveryAt: null,
      shippedAt: null,
      deliveredAt: null,
    },
    couponCode: null,
    discountMinor: 0,
    shippingMinor: 0,
    customerNote: 'Awaiting company purchase order approval.',
    timeline: [
      {
        status: 'pending',
        at: '2026-08-21T07:38:00.000Z',
        note: 'Awaiting bank transfer',
      },
    ],
  },

  // ---------- on-hold ----------
  {
    id: 'ord-9009',
    reference: 'LUM-2026-9009',
    userId: 'usr-1004',
    status: 'on-hold',
    placedAt: '2026-08-14T22:19:00.000Z',
    lines: [
      { productId: 'prd-0028', quantity: 1, unitPriceMinor: 189900 },
      { productId: 'prd-0032', quantity: 1, unitPriceMinor: 104900 },
    ],
    shippingAddressId: 'adr-0008',
    billingAddressId: 'adr-0009',
    payment: { kind: 'card', status: 'authorised', maskedIdentifier: '3390', brand: 'Visa' },
    shipping: {
      method: 'express',
      carrier: null,
      trackingNumber: null,
      estimatedDeliveryAt: null,
      shippedAt: null,
      deliveredAt: null,
    },
    couponCode: null,
    discountMinor: 0,
    shippingMinor: 1495,
    customerNote: null,
    timeline: [
      { status: 'pending', at: '2026-08-14T22:19:00.000Z', note: 'Order placed' },
      { status: 'processing', at: '2026-08-14T22:21:00.000Z', note: 'Payment authorised' },
      {
        status: 'on-hold',
        at: '2026-08-15T09:04:00.000Z',
        note: 'Held for address verification — billing country differs from card issuer',
      },
    ],
  },

  // ---------- cancelled ----------
  {
    id: 'ord-9010',
    reference: 'LUM-2026-9010',
    userId: 'usr-1002',
    status: 'cancelled',
    placedAt: '2026-07-25T13:11:00.000Z',
    lines: [{ productId: 'prd-0022', quantity: 1, unitPriceMinor: 84900 }],
    shippingAddressId: 'adr-0004',
    billingAddressId: 'adr-0005',
    payment: { kind: 'card', status: 'refunded', maskedIdentifier: '5518', brand: 'Mastercard' },
    shipping: {
      method: 'standard',
      carrier: null,
      trackingNumber: null,
      estimatedDeliveryAt: null,
      shippedAt: null,
      deliveredAt: null,
    },
    couponCode: null,
    discountMinor: 0,
    shippingMinor: 0,
    customerNote: null,
    timeline: [
      { status: 'pending', at: '2026-07-25T13:11:00.000Z', note: 'Order placed' },
      { status: 'processing', at: '2026-07-25T13:13:00.000Z', note: 'Payment captured' },
      {
        status: 'cancelled',
        at: '2026-07-25T18:47:00.000Z',
        note: 'Cancelled by customer before dispatch; payment voided',
      },
    ],
  },
  {
    id: 'ord-9011',
    reference: 'LUM-2026-9011',
    userId: 'usr-1005',
    status: 'cancelled',
    placedAt: '2026-06-08T09:24:00.000Z',
    lines: [{ productId: 'prd-0011', quantity: 1, unitPriceMinor: 54900 }],
    shippingAddressId: 'adr-0010',
    billingAddressId: 'adr-0011',
    payment: { kind: 'card', status: 'refunded', maskedIdentifier: '7731', brand: 'Visa' },
    shipping: {
      method: 'standard',
      carrier: null,
      trackingNumber: null,
      estimatedDeliveryAt: null,
      shippedAt: null,
      deliveredAt: null,
    },
    couponCode: null,
    discountMinor: 0,
    shippingMinor: 0,
    customerNote: null,
    timeline: [
      { status: 'pending', at: '2026-06-08T09:24:00.000Z', note: 'Order placed' },
      {
        status: 'cancelled',
        at: '2026-06-09T11:02:00.000Z',
        note: 'Cancelled by support — stock unavailable at the promised date',
      },
    ],
  },

  // ---------- refunded ----------
  {
    id: 'ord-9012',
    reference: 'LUM-2026-9012',
    userId: 'usr-1001',
    status: 'refunded',
    placedAt: '2026-04-19T16:55:00.000Z',
    lines: [{ productId: 'prd-0003', quantity: 1, unitPriceMinor: 49900 }],
    shippingAddressId: 'adr-0001',
    billingAddressId: 'adr-0002',
    payment: { kind: 'card', status: 'refunded', maskedIdentifier: '4417', brand: 'Visa' },
    shipping: {
      method: 'standard',
      carrier: 'Royal Mail',
      trackingNumber: 'RM4471099317GB',
      estimatedDeliveryAt: '2026-04-24T00:00:00.000Z',
      shippedAt: '2026-04-20T10:41:00.000Z',
      deliveredAt: '2026-04-23T12:09:00.000Z',
    },
    couponCode: null,
    discountMinor: 0,
    shippingMinor: 0,
    customerNote: null,
    timeline: [
      { status: 'pending', at: '2026-04-19T16:55:00.000Z', note: 'Order placed' },
      { status: 'processing', at: '2026-04-19T16:57:00.000Z', note: 'Payment captured' },
      { status: 'shipped', at: '2026-04-20T10:41:00.000Z', note: null },
      { status: 'delivered', at: '2026-04-23T12:09:00.000Z', note: null },
      {
        status: 'refunded',
        at: '2026-05-06T14:30:00.000Z',
        note: 'Refunded in full — clamping force unsuitable for customer',
      },
    ],
  },

  // ---------- returned ----------
  {
    id: 'ord-9013',
    reference: 'LUM-2026-9013',
    userId: 'usr-1004',
    status: 'returned',
    placedAt: '2026-03-14T11:20:00.000Z',
    lines: [
      { productId: 'prd-0021', quantity: 1, unitPriceMinor: 32900 },
      { productId: 'prd-0048', quantity: 1, unitPriceMinor: 5900 },
    ],
    shippingAddressId: 'adr-0008',
    billingAddressId: 'adr-0009',
    payment: {
      kind: 'card',
      status: 'partially-refunded',
      maskedIdentifier: '3390',
      brand: 'Visa',
    },
    shipping: {
      method: 'standard',
      carrier: 'DPD',
      trackingNumber: 'DPD7718220041',
      estimatedDeliveryAt: '2026-03-19T00:00:00.000Z',
      shippedAt: '2026-03-15T09:33:00.000Z',
      deliveredAt: '2026-03-18T15:12:00.000Z',
    },
    couponCode: null,
    discountMinor: 0,
    shippingMinor: 1295,
    customerNote: null,
    timeline: [
      { status: 'pending', at: '2026-03-14T11:20:00.000Z', note: 'Order placed' },
      { status: 'processing', at: '2026-03-14T11:22:00.000Z', note: 'Payment captured' },
      { status: 'shipped', at: '2026-03-15T09:33:00.000Z', note: null },
      { status: 'delivered', at: '2026-03-18T15:12:00.000Z', note: null },
      {
        status: 'returned',
        at: '2026-04-02T10:15:00.000Z',
        note: 'Monitor returned as faulty; charger kept. Partial refund issued.',
      },
    ],
  },

  // ---------- a second pending, older, for status filtering ----------
  {
    id: 'ord-9014',
    reference: 'LUM-2026-9014',
    userId: 'usr-1003',
    status: 'pending',
    placedAt: '2026-08-11T20:03:00.000Z',
    lines: [
      { productId: 'prd-0042', quantity: 1, unitPriceMinor: 14900 },
      { productId: 'prd-0043', quantity: 2, unitPriceMinor: 5900 },
    ],
    shippingAddressId: 'adr-0006',
    billingAddressId: 'adr-0007',
    payment: { kind: 'gift-card', status: 'unpaid', maskedIdentifier: '****8820', brand: null },
    shipping: {
      method: 'collection',
      carrier: null,
      trackingNumber: null,
      estimatedDeliveryAt: null,
      shippedAt: null,
      deliveredAt: null,
    },
    couponCode: null,
    discountMinor: 0,
    shippingMinor: 0,
    customerNote: 'Collecting from the Edinburgh store.',
    timeline: [
      {
        status: 'pending',
        at: '2026-08-11T20:03:00.000Z',
        note: 'Awaiting gift card balance confirmation',
      },
    ],
  },
];
