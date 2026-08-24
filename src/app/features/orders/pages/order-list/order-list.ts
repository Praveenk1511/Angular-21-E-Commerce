import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
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

export type OrderFilterTab = 'all' | 'active' | 'delivered' | 'cancelled';

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
  pending: 'Pending',
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

/**
 * Customer Order History List Page (/orders).
 *
 * Renders list of past and active orders with status badges, line item thumbnails,
 * placement dates, grand totals, status filter tabs, and detail view navigation.
 */
@Component({
  selector: 'app-order-list',
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
  templateUrl: './order-list.html',
  styleUrl: './order-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderList {
  protected readonly ordersStore = inject(OrdersStore);
  private readonly toast = inject(ToastService);

  protected readonly productsUrl = APP_URLS.products;
  protected readonly activeTab = signal<OrderFilterTab>('all');

  protected readonly filteredOrders = computed(() => {
    const tab = this.activeTab();
    const all = this.ordersStore.userOrders();

    if (tab === 'active') {
      return all.filter(
        (o) =>
          o.status === 'pending' ||
          o.status === 'confirmed' ||
          o.status === 'processing' ||
          o.status === 'on-hold' ||
          o.status === 'shipped' ||
          o.status === 'out-for-delivery',
      );
    }
    if (tab === 'delivered') {
      return all.filter((o) => o.status === 'delivered');
    }
    if (tab === 'cancelled') {
      return all.filter((o) => o.status === 'cancelled' || o.status === 'returned');
    }

    return all;
  });

  protected setTab(tab: OrderFilterTab): void {
    this.activeTab.set(tab);
  }

  protected getOrderDetailUrl(id: string): string {
    return APP_URLS.orderDetail(id);
  }

  protected getStatusVariant(status: OrderStatus): BadgeVariant {
    return STATUS_VARIANT_MAP[status] ?? 'neutral';
  }

  protected getStatusLabel(status: OrderStatus): string {
    return STATUS_LABEL_MAP[status] ?? status;
  }

  protected cancelOrder(event: Event, orderId: string, ref: string): void {
    event.stopPropagation();
    const success = this.ordersStore.cancelOrder(orderId, 'Cancelled from order list');
    if (success) {
      this.toast.show({
        variant: 'info',
        title: 'Order Cancelled',
        message: `Order ${ref} has been cancelled.`,
      });
    }
  }
}
