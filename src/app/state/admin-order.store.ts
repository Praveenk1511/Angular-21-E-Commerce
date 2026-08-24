import { Injectable, computed, signal } from '@angular/core';

import type { Order, OrderEvent, OrderStatus } from '@core/models';

const ORDERS_STORAGE_KEY = 'lumen_user_orders';

export const ALLOWED_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled', 'on-hold'],
  processing: ['shipped', 'cancelled', 'on-hold'],
  'on-hold': ['processing', 'cancelled'],
  shipped: ['out-for-delivery', 'delivered', 'cancelled'],
  'out-for-delivery': ['delivered', 'cancelled'],
  delivered: ['returned', 'refunded'],
  cancelled: ['refunded'],
  returned: ['refunded'],
  refunded: [],
};

const MOCK_INITIAL_ADMIN_ORDERS: readonly Order[] = [
  {
    id: 'ORD-984102',
    reference: 'ORD-984102',
    userId: 'user-1',
    status: 'delivered',
    placedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    itemCount: 2,
    totals: {
      currency: 'INR',
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
        productName: 'Ergonomic Desk Chair Pro',
        productSlug: 'ergonomic-desk-chair-pro',
        sku: 'CHAIR-ERG-01',
        quantity: 1,
        unitPrice: { currency: 'INR', amountMinor: 12999, compareAtMinor: 14999 },
        lineTotalMinor: 12999,
      },
      {
        id: 'line-102',
        productId: 'prod-2',
        productName: 'Precision Wireless Mouse',
        productSlug: 'precision-wireless-mouse',
        sku: 'MOUSE-PREC-02',
        quantity: 1,
        unitPrice: { currency: 'INR', amountMinor: 2000 },
        lineTotalMinor: 2000,
      },
    ],
    shippingAddress: {
      id: 'addr-1',
      userId: 'user-1',
      type: 'shipping',
      label: 'Home',
      recipient: 'Ananya Sharma',
      line1: 'Flat 502, Green Acres Apartments',
      line2: 'HSR Layout, Sector 3',
      city: 'Bengaluru',
      region: 'Karnataka',
      postcode: '560102',
      countryCode: 'IN',
      phone: '+91 98450 12345',
      isDefault: true,
    },
    billingAddress: {
      id: 'addr-1',
      userId: 'user-1',
      type: 'billing',
      label: 'Home',
      recipient: 'Ananya Sharma',
      line1: 'Flat 502, Green Acres Apartments',
      line2: 'HSR Layout, Sector 3',
      city: 'Bengaluru',
      region: 'Karnataka',
      postcode: '560102',
      countryCode: 'IN',
      phone: '+91 98450 12345',
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
      carrier: 'Delhivery Express',
      trackingNumber: 'DELHIVERY984102847IN',
      estimatedDeliveryAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      shippedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
      deliveredAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    couponCode: null,
    customerNote: 'Please leave at front door if unavailable.',
    timeline: [
      { status: 'pending', at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), note: 'Order submitted by customer.' },
      { status: 'confirmed', at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000 + 3600000).toISOString(), note: 'Payment verified (Visa).' },
      { status: 'processing', at: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(), note: 'Order packed at logistics center.' },
      { status: 'shipped', at: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000 + 7200000).toISOString(), note: 'Dispatched via Royal Mail.' },
      { status: 'out-for-delivery', at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000 - 14400000).toISOString(), note: 'Package out with courier.' },
      { status: 'delivered', at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), note: 'Delivered and signed by recipient.' },
    ],
  },
  {
    id: 'ORD-652914',
    reference: 'ORD-652914',
    userId: 'user-2',
    status: 'processing',
    placedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    itemCount: 1,
    totals: {
      currency: 'INR',
      subtotalMinor: 19998,
      discountMinor: 0,
      shippingMinor: 0,
      taxMinor: 4000,
      grandTotalMinor: 19998,
    },
    lines: [
      {
        id: 'line-201',
        productId: 'prod-3',
        productName: 'Wireless Noise-Cancelling Headphones',
        productSlug: 'wireless-noise-cancelling-headphones',
        sku: 'HEAD-ANC-03',
        quantity: 1,
        unitPrice: { currency: 'INR', amountMinor: 19998 },
        lineTotalMinor: 19998,
      },
    ],
    shippingAddress: {
      id: 'addr-2',
      userId: 'user-2',
      type: 'shipping',
      label: 'Office',
      recipient: 'Marcus Vance',
      line1: '100 Victoria Embankment',
      line2: 'Floor 5',
      city: 'London',
      region: 'Greater London',
      postcode: 'EC4Y 0DH',
      countryCode: 'GB',
      phone: '+44 20 7946 0912',
      isDefault: true,
    },
    billingAddress: {
      id: 'addr-2',
      userId: 'user-2',
      type: 'billing',
      label: 'Office',
      recipient: 'Marcus Vance',
      line1: '100 Victoria Embankment',
      line2: 'Floor 5',
      city: 'London',
      region: 'Greater London',
      postcode: 'EC4Y 0DH',
      countryCode: 'GB',
      phone: '+44 20 7946 0912',
      isDefault: true,
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
      shippedAt: null,
      deliveredAt: null,
    },
    couponCode: null,
    customerNote: null,
    timeline: [
      { status: 'pending', at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), note: 'Order submitted.' },
      { status: 'confirmed', at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 1800000).toISOString(), note: 'Payment confirmed.' },
      { status: 'processing', at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), note: 'Items picked and ready for courier.' },
    ],
  },
  {
    id: 'ORD-332910',
    reference: 'ORD-332910',
    userId: 'user-3',
    status: 'pending',
    placedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    itemCount: 3,
    totals: {
      currency: 'INR',
      subtotalMinor: 52998,
      discountMinor: 5000,
      shippingMinor: 499,
      taxMinor: 10000,
      grandTotalMinor: 52998,
    },
    lines: [
      {
        id: 'line-301',
        productId: 'prod-4',
        productName: 'Ultra-Wide 34" Curved Monitor',
        productSlug: 'ultra-wide-34-curved-monitor',
        sku: 'MON-CURV-04',
        quantity: 1,
        unitPrice: { currency: 'INR', amountMinor: 52998 },
        lineTotalMinor: 52998,
      },
    ],
    shippingAddress: {
      id: 'addr-3',
      userId: 'user-3',
      type: 'shipping',
      label: 'Home',
      recipient: 'Elena Rostova',
      line1: '45 Deansgate',
      line2: '',
      city: 'Manchester',
      region: 'Greater Manchester',
      postcode: 'M3 2AY',
      countryCode: 'GB',
      phone: '+44 161 496 0123',
      isDefault: true,
    },
    billingAddress: {
      id: 'addr-3',
      userId: 'user-3',
      type: 'billing',
      label: 'Home',
      recipient: 'Elena Rostova',
      line1: '45 Deansgate',
      line2: '',
      city: 'Manchester',
      region: 'Greater Manchester',
      postcode: 'M3 2AY',
      countryCode: 'GB',
      phone: '+44 161 496 0123',
      isDefault: true,
    },
    payment: {
      kind: 'bank-transfer',
      status: 'unpaid',
      maskedIdentifier: 'UPI-ELENA@OKBANK',
      brand: 'UPI',
    },
    shipping: {
      method: 'standard',
      carrier: 'DHL Express',
      trackingNumber: null,
      estimatedDeliveryAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      shippedAt: null,
      deliveredAt: null,
    },
    couponCode: 'TECH20',
    customerNote: null,
    timeline: [
      { status: 'pending', at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), note: 'Awaiting payment confirmation.' },
    ],
  },
];

/**
 * Root state manager for Admin Order Fulfillment, Order Status State Machine,
 * search filtering, sorting, and Order Details inspection drawer.
 */
@Injectable({ providedIn: 'root' })
export class AdminOrderStore {
  // ---------- State Signals ----------
  private readonly ordersSignal = signal<readonly Order[]>([]);
  readonly searchQuery = signal<string>('');
  readonly statusFilter = signal<OrderStatus | 'all'>('all');
  readonly sortOption = signal<'date-desc' | 'date-asc' | 'total-desc' | 'total-asc'>('date-desc');

  readonly activePage = signal<number>(1);
  readonly pageSize = signal<number>(5);
  readonly selectedOrder = signal<Order | null>(null);

  // ---------- Derived Data ----------

  readonly paginatedData = computed(() => {
    let list = [...this.ordersSignal()];
    const q = this.searchQuery().trim().toLowerCase();
    const st = this.statusFilter();
    const sort = this.sortOption();

    if (q) {
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.reference.toLowerCase().includes(q) ||
          o.shippingAddress.recipient.toLowerCase().includes(q) ||
          (o.shippingAddress.phone ? o.shippingAddress.phone.toLowerCase().includes(q) : false),
      );
    }

    if (st !== 'all') {
      list = list.filter((o) => o.status === st);
    }

    list.sort((a, b) => {
      switch (sort) {
        case 'date-asc':
          return new Date(a.placedAt).getTime() - new Date(b.placedAt).getTime();
        case 'total-desc':
          return b.totals.grandTotalMinor - a.totals.grandTotalMinor;
        case 'total-asc':
          return a.totals.grandTotalMinor - b.totals.grandTotalMinor;
        case 'date-desc':
        default:
          return new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime();
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
  });

  readonly totalCount = computed(() => this.ordersSignal().length);

  constructor() {
    this.readStoredOrders();
  }

  // ---------- Filter Actions ----------

  setSearchQuery(q: string): void {
    this.searchQuery.set(q);
    this.activePage.set(1);
  }

  setStatusFilter(status: OrderStatus | 'all'): void {
    this.statusFilter.set(status);
    this.activePage.set(1);
  }

  setSortOption(sort: 'date-desc' | 'date-asc' | 'total-desc' | 'total-asc'): void {
    this.sortOption.set(sort);
    this.activePage.set(1);
  }

  setPage(page: number): void {
    this.activePage.set(page);
  }

  openOrderDetails(order: Order): void {
    this.selectedOrder.set(order);
  }

  closeOrderDetails(): void {
    this.selectedOrder.set(null);
  }

  canCancel(status: OrderStatus): boolean {
    return status === 'pending' || status === 'confirmed' || status === 'processing' || status === 'on-hold';
  }

  // ---------- State Machine & Transition Actions ----------

  isValidTransition(currentStatus: OrderStatus, targetStatus: OrderStatus): boolean {
    const allowed = ALLOWED_TRANSITIONS[currentStatus] ?? [];
    return allowed.includes(targetStatus);
  }

  getValidNextStatuses(currentStatus: OrderStatus): readonly OrderStatus[] {
    return ALLOWED_TRANSITIONS[currentStatus] ?? [];
  }

  updateOrderStatus(orderId: string, nextStatus: OrderStatus, note?: string): { success: boolean; message: string } {
    const list = [...this.ordersSignal()];
    const idx = list.findIndex((o) => o.id === orderId || o.reference === orderId);

    if (idx === -1) {
      return { success: false, message: `Order "${orderId}" not found.` };
    }

    const order = list[idx]!;
    if (!this.isValidTransition(order.status, nextStatus)) {
      return {
        success: false,
        message: `Cannot transition order status from "${order.status}" to "${nextStatus}". Invalid workflow state.`,
      };
    }

    const nowIso = new Date().toISOString();
    const newEvent: OrderEvent = {
      status: nextStatus,
      at: nowIso,
      note: note || `Status updated to ${nextStatus} by administrator.`,
    };

    const updatedOrder: Order = {
      ...order,
      status: nextStatus,
      timeline: [...order.timeline, newEvent],
    };

    list[idx] = updatedOrder;
    this.updateOrdersState(list);

    if (this.selectedOrder()?.id === order.id) {
      this.selectedOrder.set(updatedOrder);
    }

    return { success: true, message: `Order ${order.id} status updated to ${nextStatus}.` };
  }

  cancelOrder(orderId: string, reason?: string): { success: boolean; message: string } {
    return this.updateOrderStatus(orderId, 'cancelled', reason ?? 'Order cancelled by administrator');
  }

  refundOrder(orderId: string, reason?: string): { success: boolean; message: string } {
    return this.updateOrderStatus(orderId, 'refunded', reason ?? 'Order refunded by administrator');
  }

  processReturn(orderId: string, reason?: string): { success: boolean; message: string } {
    return this.updateOrderStatus(orderId, 'returned', reason ?? 'Return request processed by administrator');
  }

  // ---------- Internals ----------

  private updateOrdersState(list: readonly Order[]): void {
    this.ordersSignal.set(list);
    this.persistOrders(list);
  }

  private readStoredOrders(): void {
    try {
      const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.ordersSignal.set(parsed as Order[]);
          return;
        }
      }
    } catch {
      // Swallowed
    }

    this.ordersSignal.set(MOCK_INITIAL_ADMIN_ORDERS);
    this.persistOrders(MOCK_INITIAL_ADMIN_ORDERS);
  }

  private persistOrders(list: readonly Order[]): void {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(list));
    } catch {
      // Swallowed
    }
  }
}
