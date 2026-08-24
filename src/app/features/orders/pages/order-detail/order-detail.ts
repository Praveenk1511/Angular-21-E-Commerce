import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { APP_URLS } from '@core/config/route-paths';
import type { OrderStatus } from '@core/models';
import { Badge, type BadgeVariant } from '@shared/components/badge/badge';
import { Button } from '@shared/components/button/button';
import { EmptyState } from '@shared/components/empty-state/empty-state';
import { Icon } from '@shared/components/icon/icon';
import { PageContainer } from '@shared/components/page-container/page-container';
import { ToastService } from '@shared/components/toast/toast.service';
import { PricePipe } from '@shared/pipes/price.pipe';
import { OrdersStore } from '@state/orders.store';

const STATUS_VARIANT_MAP: Record<OrderStatus, BadgeVariant> = {
  pending: 'warning',
  confirmed: 'brand',
  processing: 'brand',
  'on-hold': 'warning',
  shipped: 'brand',
  'out-for-delivery': 'warning',
  delivered: 'success',
  cancelled: 'danger',
  returned: 'neutral',
  refunded: 'neutral',
};

const STATUS_LABEL_MAP: Record<OrderStatus, string> = {
  pending: 'Order Placed',
  confirmed: 'Confirmed',
  processing: 'Processing',
  'on-hold': 'On Hold',
  shipped: 'Shipped',
  'out-for-delivery': 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  returned: 'Returned',
  refunded: 'Refunded',
};

export interface TrackingStep {
  readonly status: OrderStatus;
  readonly label: string;
  readonly isCompleted: boolean;
  readonly isActive: boolean;
}

const ORDER_LIFECYCLE_SEQUENCE: readonly OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'out-for-delivery',
  'delivered',
];

/**
 * Customer Order Details Page (/orders/:id).
 *
 * Renders complete order breakdown, visual order tracking timeline, purchased items,
 * delivery address, payment receipt info, financial breakdown, and customer actions (Cancel / Return).
 */
@Component({
  selector: 'app-order-detail',
  imports: [
    RouterLink,
    DatePipe,
    PageContainer,
    Badge,
    Button,
    Icon,
    EmptyState,
    PricePipe,
  ],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetail {
  /** Bound from the `:id` route parameter by `withComponentInputBinding()`. */
  readonly id = input.required<string>();

  protected readonly ordersStore = inject(OrdersStore);
  private readonly toast = inject(ToastService);

  protected readonly ordersUrl = APP_URLS.orders;

  protected readonly order = computed(() => this.ordersStore.getOrderById(this.id()));

  protected readonly trackingSteps = computed<readonly TrackingStep[]>(() => {
    const currentOrder = this.order();
    if (!currentOrder) {
      return [];
    }

    const currentStatus = currentOrder.status;
    if (
      currentStatus === 'cancelled' ||
      currentStatus === 'returned' ||
      currentStatus === 'refunded' ||
      currentStatus === 'on-hold'
    ) {
      return [];
    }

    const currentIndex = ORDER_LIFECYCLE_SEQUENCE.indexOf(currentStatus);

    return ORDER_LIFECYCLE_SEQUENCE.map((status, idx) => ({
      status,
      label: STATUS_LABEL_MAP[status] ?? status,
      isCompleted: idx <= currentIndex,
      isActive: idx === currentIndex,
    }));
  });

  protected getStatusVariant(status: OrderStatus): BadgeVariant {
    return STATUS_VARIANT_MAP[status] ?? 'neutral';
  }

  protected getStatusLabel(status: OrderStatus): string {
    return STATUS_LABEL_MAP[status] ?? status;
  }

  protected cancelOrder(orderId: string, ref: string): void {
    const success = this.ordersStore.cancelOrder(orderId, 'Cancelled by customer from order details page.');
    if (success) {
      this.toast.show({
        variant: 'info',
        title: 'Order Cancelled',
        message: `Order ${ref} has been cancelled.`,
      });
    } else {
      this.toast.error('Cannot Cancel Order', 'This order can no longer be cancelled.');
    }
  }

  protected returnOrder(orderId: string, ref: string): void {
    const success = this.ordersStore.returnOrder(orderId, 'Return requested by customer.');
    if (success) {
      this.toast.success('Return Requested', `Return request logged for Order ${ref}.`);
    } else {
      this.toast.error('Cannot Request Return', 'Only delivered orders can be returned.');
    }
  }
}
