import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { NotificationKind } from '@core/models';
import { Badge, type BadgeVariant } from '@shared/components/badge/badge';
import { Button } from '@shared/components/button/button';
import { EmptyState } from '@shared/components/empty-state/empty-state';
import { Icon } from '@shared/components/icon/icon';
import type { IconName } from '@shared/components/icon/icon-name';
import { PageContainer } from '@shared/components/page-container/page-container';
import { ToastService } from '@shared/components/toast/toast.service';
import { NotificationStore } from '@state/notification.store';

export type NotificationTab = 'all' | 'unread' | 'orders' | 'promotions';

const KIND_VARIANT_MAP: Record<NotificationKind, BadgeVariant> = {
  order: 'brand',
  payment: 'success',
  account: 'neutral',
  promotion: 'warning',
  system: 'neutral',
  stock: 'warning',
  'price-drop': 'success',
};

/**
 * Dedicated Customer Notifications Page (/notifications).
 *
 * Renders full notification history, unread filters, type icons, mark read/delete actions,
 * and navigation links for orders, payments, promotions, and system alerts.
 */
@Component({
  selector: 'app-notifications-page',
  imports: [
    RouterLink,
    DatePipe,
    PageContainer,
    Badge,
    Button,
    Icon,
    EmptyState,
  ],
  templateUrl: './notifications-page.html',
  styleUrl: './notifications-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsPage {
  protected readonly notificationStore = inject(NotificationStore);
  private readonly toast = inject(ToastService);

  protected readonly activeTab = signal<NotificationTab>('all');

  protected readonly filteredNotifications = computed(() => {
    const tab = this.activeTab();
    const all = this.notificationStore.notifications();

    if (tab === 'unread') {
      return all.filter((n) => !n.readAt);
    }
    if (tab === 'orders') {
      return all.filter((n) => n.kind === 'order' || n.kind === 'payment');
    }
    if (tab === 'promotions') {
      return all.filter((n) => n.kind === 'promotion' || n.kind === 'system' || n.kind === 'account');
    }

    return all;
  });

  protected setTab(tab: NotificationTab): void {
    this.activeTab.set(tab);
  }

  protected getKindVariant(kind: NotificationKind): BadgeVariant {
    return KIND_VARIANT_MAP[kind] ?? 'neutral';
  }

  protected getKindIcon(kind: NotificationKind): IconName {
    switch (kind) {
      case 'order':
        return 'cart';
      case 'payment':
        return 'check-circle';
      case 'account':
        return 'user';
      case 'promotion':
        return 'star';
      case 'system':
      default:
        return 'info';
    }
  }

  protected markAsRead(id: string): void {
    this.notificationStore.markAsRead(id);
  }

  protected markAllAsRead(): void {
    this.notificationStore.markAllAsRead();
    this.toast.success('Notifications Updated', 'All notifications marked as read.');
  }

  protected deleteNotification(id: string): void {
    this.notificationStore.deleteNotification(id);
    this.toast.show({
      variant: 'info',
      title: 'Notification Deleted',
      message: 'Notification has been removed.',
    });
  }

  protected clearAllRead(): void {
    this.notificationStore.clearAllRead();
    this.toast.show({
      variant: 'info',
      title: 'Cleared Read Alerts',
      message: 'All read notifications have been removed.',
    });
  }
}
