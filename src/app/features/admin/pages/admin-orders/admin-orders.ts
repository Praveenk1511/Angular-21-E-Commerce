import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import type { Order, OrderStatus } from '@core/models';
import { Badge, type BadgeVariant } from '@shared/components/badge/badge';
import { Button } from '@shared/components/button/button';
import { EmptyState } from '@shared/components/empty-state/empty-state';
import { Icon } from '@shared/components/icon/icon';
import { ToastService } from '@shared/components/toast/toast.service';
import { PricePipe } from '@shared/pipes/price.pipe';
import { AdminOrderStore } from '@state/admin-order.store';

/**
 * Admin Order Management Page (/admin/orders).
 *
 * Renders Order Data Table with real-time search, status filter pills, sorting, pagination,
 * Order Details inspection drawer, and strict Order Status Workflow State Machine validation.
 */
@Component({
  selector: 'app-admin-orders',
  imports: [
    DatePipe,
    Badge,
    Button,
    Icon,
    EmptyState,
    PricePipe,
  ],
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOrders {
  protected readonly store = inject(AdminOrderStore);
  private readonly toast = inject(ToastService);

  protected onStatusChange(order: Order, event: Event): void {
    const nextStatus = (event.target as HTMLSelectElement).value as OrderStatus;
    if (!nextStatus) return;

    const res = this.store.updateOrderStatus(order.id, nextStatus);
    if (res.success) {
      this.toast.success('Order Status Updated', res.message);
    } else {
      this.toast.error('Invalid Status Transition', res.message);
    }
  }

  protected advanceStatus(order: Order, nextStatus: OrderStatus): void {
    const res = this.store.updateOrderStatus(order.id, nextStatus);
    if (res.success) {
      this.toast.success('Status Updated', res.message);
    } else {
      this.toast.error('Workflow Error', res.message);
    }
  }

  protected cancelOrder(order: Order): void {
    const res = this.store.cancelOrder(order.id);
    if (res.success) {
      this.toast.show({ variant: 'info', title: 'Order Cancelled', message: res.message });
    } else {
      this.toast.error('Cannot Cancel Order', res.message);
    }
  }

  protected processReturn(order: Order): void {
    const res = this.store.processReturn(order.id);
    if (res.success) {
      this.toast.show({ variant: 'info', title: 'Return Processed', message: res.message });
    } else {
      this.toast.error('Cannot Return Order', res.message);
    }
  }

  protected refundOrder(order: Order): void {
    const res = this.store.refundOrder(order.id);
    if (res.success) {
      this.toast.show({ variant: 'info', title: 'Order Refunded', message: res.message });
    } else {
      this.toast.error('Cannot Refund Order', res.message);
    }
  }

  protected getOrderStatusVariant(status: OrderStatus): BadgeVariant {
    switch (status) {
      case 'delivered':
        return 'success';
      case 'confirmed':
      case 'processing':
      case 'out-for-delivery':
        return 'brand';
      case 'shipped':
        return 'neutral';
      case 'pending':
      case 'on-hold':
        return 'warning';
      case 'cancelled':
      case 'refunded':
      case 'returned':
        return 'danger';
      default:
        return 'neutral';
    }
  }
}
