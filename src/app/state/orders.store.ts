import { Injectable, computed, signal } from '@angular/core';

import type {
  Address,
  CartItem,
  DeliveryOption,
  Order,
  OrderEvent,
  OrderLine,
  OrderStatus,
  OrderTotals,
  PaymentMethodType,
} from '@core/models';

const ORDERS_STORAGE_KEY = 'lumen_user_orders';

const MOCK_INITIAL_ORDERS: readonly Order[] = [
  {
    id: 'ORD-984102',
    reference: 'ORD-984102',
    userId: 'user-1',
    status: 'delivered',
    placedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    itemCount: 2,
    totals: {
      currency: 'GBP',
      subtotalMinor: 14999,
      discountMinor: 2000,
      shippingMinor: 0,
      taxMinor: 3000,
      grandTotalMinor: 14999,
    },
    lines: [
      {
        id: 'line-101',
        productId: 'prod-1',
        productName: 'Ergonomic Office Chair',
        productSlug: 'ergonomic-office-chair',
        sku: 'CHAIR-ERG-01',
        quantity: 1,
        unitPrice: { currency: 'GBP', amountMinor: 12999, compareAtMinor: 14999 },
        lineTotalMinor: 12999,
      },
      {
        id: 'line-102',
        productId: 'prod-2',
        productName: 'Precision Wireless Mouse',
        productSlug: 'precision-wireless-mouse',
        sku: 'MOUSE-WLS-02',
        quantity: 1,
        unitPrice: { currency: 'GBP', amountMinor: 2000 },
        lineTotalMinor: 2000,
      },
    ],
    shippingAddress: {
      id: 'addr-1',
      userId: 'user-1',
      type: 'shipping',
      label: 'Home',
      recipient: 'Alex Morgan',
      line1: '742 Evergreen Terrace',
      line2: 'Apt 4B',
      city: 'London',
      region: 'Greater London',
      postcode: 'SW1A 1AA',
      countryCode: 'GB',
      phone: '+44 7911 123456',
      isDefault: true,
    },
    billingAddress: {
      id: 'addr-1',
      userId: 'user-1',
      type: 'billing',
      label: 'Home',
      recipient: 'Alex Morgan',
      line1: '742 Evergreen Terrace',
      line2: 'Apt 4B',
      city: 'London',
      region: 'Greater London',
      postcode: 'SW1A 1AA',
      countryCode: 'GB',
      phone: '+44 7911 123456',
      isDefault: true,
    },
    payment: {
      kind: 'card',
      status: 'paid',
      maskedIdentifier: '•••• 5566',
      brand: 'Visa',
    },
    shipping: {
      method: 'standard',
      carrier: 'Royal Mail Tracked',
      trackingNumber: 'GB984102847RM',
      estimatedDeliveryAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      shippedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
      deliveredAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    couponCode: null,
    customerNote: null,
    timeline: [
      {
        status: 'pending',
        at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        note: 'Order submitted by customer.',
      },
      {
        status: 'confirmed',
        at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000 + 3600000).toISOString(),
        note: 'Payment verified and order confirmed.',
      },
      {
        status: 'processing',
        at: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
        note: 'Order packed at logistics center.',
      },
      {
        status: 'shipped',
        at: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000 + 7200000).toISOString(),
        note: 'Dispatched via Royal Mail (Tracking: GB984102847RM).',
      },
      {
        status: 'out-for-delivery',
        at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000 - 14400000).toISOString(),
        note: 'Package out with courier for local delivery.',
      },
      {
        status: 'delivered',
        at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        note: 'Delivered and signed by recipient.',
      },
    ],
  },
  {
    id: 'ORD-652914',
    reference: 'ORD-652914',
    userId: 'user-1',
    status: 'shipped',
    placedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    itemCount: 1,
    totals: {
      currency: 'GBP',
      subtotalMinor: 18999,
      discountMinor: 0,
      shippingMinor: 999,
      taxMinor: 3800,
      grandTotalMinor: 19998,
    },
    lines: [
      {
        id: 'line-201',
        productId: 'prod-3',
        productName: 'ANC Wireless Headphones',
        productSlug: 'anc-wireless-headphones',
        sku: 'AUDIO-ANC-03',
        quantity: 1,
        unitPrice: { currency: 'GBP', amountMinor: 18999 },
        lineTotalMinor: 18999,
      },
    ],
    shippingAddress: {
      id: 'addr-2',
      userId: 'user-1',
      type: 'shipping',
      label: 'Office',
      recipient: 'Alex Morgan (TechCorp)',
      line1: '100 Victoria Embankment',
      line2: 'Floor 5',
      city: 'London',
      region: 'Greater London',
      postcode: 'EC4Y 0DH',
      countryCode: 'GB',
      phone: '+44 20 7946 0912',
      isDefault: false,
    },
    billingAddress: {
      id: 'addr-2',
      userId: 'user-1',
      type: 'billing',
      label: 'Office',
      recipient: 'Alex Morgan (TechCorp)',
      line1: '100 Victoria Embankment',
      line2: 'Floor 5',
      city: 'London',
      region: 'Greater London',
      postcode: 'EC4Y 0DH',
      countryCode: 'GB',
      phone: '+44 20 7946 0912',
      isDefault: false,
    },
    payment: {
      kind: 'card',
      status: 'paid',
      maskedIdentifier: '•••• 1121',
      brand: 'MasterCard',
    },
    shipping: {
      method: 'express',
      carrier: 'DPD Express',
      trackingNumber: 'DPD652914881UK',
      estimatedDeliveryAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      shippedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      deliveredAt: null,
    },
    couponCode: null,
    customerNote: null,
    timeline: [
      {
        status: 'pending',
        at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        note: 'Order submitted.',
      },
      {
        status: 'confirmed',
        at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 1800000).toISOString(),
        note: 'Order confirmed and sent to warehouse.',
      },
      {
        status: 'processing',
        at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        note: 'Items picked and ready for courier pickup.',
      },
      {
        status: 'shipped',
        at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        note: 'In transit with DPD Express.',
      },
    ],
  },
];

export interface CreateOrderParams {
  readonly orderRef: string;
  readonly transactionId: string;
  readonly cartItems: readonly CartItem[];
  readonly shippingAddress: Address;
  readonly deliveryOption: DeliveryOption;
  readonly paymentMethod: PaymentMethodType;
  readonly totals: OrderTotals;
}

/**
 * Root state manager for User Orders, Order Creation, Tracking, and Cancellation/Return workflows.
 */
@Injectable({ providedIn: 'root' })
export class OrdersStore {
  // ---------- Internal State ----------
  private readonly items = signal<readonly Order[]>([]);

  // ---------- Public Derived State ----------

  /** Orders list sorted newest first. */
  readonly userOrders = computed(() =>
    [...this.items()].sort(
      (a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime(),
    ),
  );

  readonly orderCount = computed(() => this.items().length);

  readonly isEmpty = computed(() => this.items().length === 0);

  constructor() {
    this.readStoredOrders();
  }

  // ---------- Helpers & Actions ----------

  getOrderById(idOrRef: string): Order | undefined {
    return this.items().find((o) => o.id === idOrRef || o.reference === idOrRef);
  }

  canCancel(status: OrderStatus): boolean {
    return status === 'pending' || status === 'confirmed' || status === 'processing';
  }

  canReturn(status: OrderStatus): boolean {
    return status === 'delivered';
  }

  /**
   * Creates a new Order after checkout payment completion.
   */
  createOrder(params: CreateOrderParams): Order {
    const lines: readonly OrderLine[] = params.cartItems.map((item, idx) => ({
      id: `line-${Date.now()}-${idx}`,
      productId: item.productId,
      productName: item.name,
      productSlug: item.slug,
      sku: `SKU-${item.productId.slice(-4).toUpperCase()}`,
      quantity: item.quantity,
      unitPrice: item.price,
      lineTotalMinor: item.price.amountMinor * item.quantity,
    }));

    const nowIso = new Date().toISOString();
    const estDeliveryDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

    const newOrder: Order = {
      id: params.orderRef,
      reference: params.orderRef,
      userId: 'user-1',
      status: 'confirmed',
      placedAt: nowIso,
      itemCount: params.cartItems.reduce((acc, i) => acc + i.quantity, 0),
      totals: params.totals,
      lines,
      shippingAddress: params.shippingAddress,
      billingAddress: params.shippingAddress,
      payment: {
        kind: params.paymentMethod === 'upi' ? 'gift-card' : 'card',
        status: 'paid',
        maskedIdentifier: params.transactionId,
        brand: params.paymentMethod.toUpperCase(),
      },
      shipping: {
        method:
          params.deliveryOption.id === 'express'
            ? 'express'
            : params.deliveryOption.id === 'same-day'
            ? 'next-day'
            : 'standard',
        carrier: 'Lumen Express Logistics',
        trackingNumber: `LM${params.orderRef.replace('ORD-', '')}UK`,
        estimatedDeliveryAt: estDeliveryDate,
        shippedAt: null,
        deliveredAt: null,
      },
      couponCode: null,
      customerNote: null,
      timeline: [
        {
          status: 'pending',
          at: nowIso,
          note: 'Order submitted by customer.',
        },
        {
          status: 'confirmed',
          at: nowIso,
          note: `Payment verified (${params.paymentMethod.toUpperCase()}). Order confirmed.`,
        },
      ],
    };

    const updated = [newOrder, ...this.items()];
    this.updateState(updated);

    return newOrder;
  }

  /**
   * Cancels an active order.
   */
  cancelOrder(orderId: string, reason?: string): boolean {
    const list = [...this.items()];
    const index = list.findIndex((o) => o.id === orderId || o.reference === orderId);

    if (index === -1) {
      return false;
    }

    const order = list[index]!;
    if (!this.canCancel(order.status)) {
      return false;
    }

    const nowIso = new Date().toISOString();
    const newEvent: OrderEvent = {
      status: 'cancelled',
      at: nowIso,
      note: reason ?? 'Cancelled by customer',
    };

    list[index] = {
      ...order,
      status: 'cancelled',
      timeline: [...order.timeline, newEvent],
    };

    this.updateState(list);
    return true;
  }

  /**
   * Initiates a return request for a delivered order.
   */
  returnOrder(orderId: string, reason?: string): boolean {
    const list = [...this.items()];
    const index = list.findIndex((o) => o.id === orderId || o.reference === orderId);

    if (index === -1) {
      return false;
    }

    const order = list[index]!;
    if (!this.canReturn(order.status)) {
      return false;
    }

    const nowIso = new Date().toISOString();
    const newEvent: OrderEvent = {
      status: 'returned',
      at: nowIso,
      note: reason ?? 'Return requested by customer',
    };

    list[index] = {
      ...order,
      status: 'returned',
      timeline: [...order.timeline, newEvent],
    };

    this.updateState(list);
    return true;
  }

  // ---------- Internals ----------

  private updateState(list: readonly Order[]): void {
    this.items.set(list);
    this.persistOrders(list);
  }

  private readStoredOrders(): void {
    try {
      const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.items.set(parsed as Order[]);
          return;
        }
      }
    } catch {
      // Storage restricted
    }

    this.items.set(MOCK_INITIAL_ORDERS);
    this.persistOrders(MOCK_INITIAL_ORDERS);
  }

  private persistOrders(list: readonly Order[]): void {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(list));
    } catch {
      // Storage full
    }
  }
}
