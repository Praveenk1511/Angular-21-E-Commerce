import { Injectable, computed, signal } from '@angular/core';

import type { AppNotification, NotificationKind, NotificationSeverity } from '@core/models';

const NOTIFICATIONS_STORAGE_KEY = 'lumen_app_notifications';

const MOCK_INITIAL_NOTIFICATIONS: readonly AppNotification[] = [
  {
    id: 'notif-1',
    userId: 'user-1',
    kind: 'order',
    severity: 'success',
    title: 'Order Delivered',
    body: 'Your order ORD-984102 has been delivered to 742 Evergreen Terrace.',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    readAt: null,
    actionUrl: '/orders/ORD-984102',
  },
  {
    id: 'notif-2',
    userId: 'user-1',
    kind: 'payment',
    severity: 'success',
    title: 'Payment Confirmed',
    body: 'Payment of £199.98 for order ORD-652914 was successfully processed.',
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    readAt: null,
    actionUrl: '/orders/ORD-652914',
  },
  {
    id: 'notif-3',
    userId: 'user-1',
    kind: 'promotion',
    severity: 'info',
    title: 'Exclusive 20% OFF Tech Gear',
    body: 'Use promo code TECH20 at checkout for 20% off all wireless audio and accessories.',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    readAt: null,
    actionUrl: '/products',
  },
  {
    id: 'notif-4',
    userId: 'user-1',
    kind: 'account',
    severity: 'info',
    title: 'Profile Details Updated',
    body: 'Your personal account details were updated successfully.',
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    readAt: new Date(Date.now() - 70 * 60 * 60 * 1000).toISOString(),
    actionUrl: '/profile/overview',
  },
  {
    id: 'notif-5',
    userId: 'user-1',
    kind: 'system',
    severity: 'info',
    title: 'Welcome to Lumen Storefront!',
    body: 'Explore curated electronics, home office gear, and premium accessories.',
    createdAt: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString(),
    readAt: new Date(Date.now() - 118 * 60 * 60 * 1000).toISOString(),
    actionUrl: '/products',
  },
];

export interface AddNotificationParams {
  readonly kind: NotificationKind;
  readonly severity?: NotificationSeverity;
  readonly title: string;
  readonly body: string;
  readonly actionUrl?: string | null;
}

/**
 * Root state manager for In-App Customer Notifications, Unread Counter Badges,
 * Dropdown Menu visibility, and Notification History.
 */
@Injectable({ providedIn: 'root' })
export class NotificationStore {
  // ---------- Internal State ----------
  private readonly items = signal<readonly AppNotification[]>([]);
  readonly isDropdownOpen = signal<boolean>(false);

  // ---------- Derived Signals ----------

  /** Readonly notifications list sorted newest first. */
  readonly notifications = computed(() =>
    [...this.items()].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ),
  );

  readonly unreadCount = computed(() => this.items().filter((n) => !n.readAt).length);

  readonly hasUnread = computed(() => this.unreadCount() > 0);

  readonly totalCount = computed(() => this.items().length);

  constructor() {
    this.readStoredNotifications();
  }

  // ---------- Dropdown Actions ----------

  toggleDropdown(): void {
    this.isDropdownOpen.update((open) => !open);
  }

  closeDropdown(): void {
    this.isDropdownOpen.set(false);
  }

  // ---------- Notification Actions ----------

  markAsRead(id: string): void {
    const list = [...this.items()];
    const idx = list.findIndex((n) => n.id === id);
    if (idx === -1 || list[idx]!.readAt !== null) return;

    list[idx] = {
      ...list[idx]!,
      readAt: new Date().toISOString(),
    };

    this.updateState(list);
  }

  markAllAsRead(): void {
    const nowIso = new Date().toISOString();
    const list = this.items().map((n) => ({
      ...n,
      readAt: n.readAt ?? nowIso,
    }));

    this.updateState(list);
  }

  deleteNotification(id: string): void {
    const list = this.items().filter((n) => n.id !== id);
    this.updateState(list);
  }

  clearAllRead(): void {
    const list = this.items().filter((n) => n.readAt === null);
    this.updateState(list);
  }

  addNotification(params: AddNotificationParams): AppNotification {
    const created: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: 'user-1',
      kind: params.kind,
      severity: params.severity ?? 'info',
      title: params.title,
      body: params.body,
      createdAt: new Date().toISOString(),
      readAt: null,
      actionUrl: params.actionUrl ?? null,
    };

    const updated = [created, ...this.items()];
    this.updateState(updated);
    return created;
  }

  // ---------- Internals ----------

  private updateState(list: readonly AppNotification[]): void {
    this.items.set(list);
    this.persistNotifications(list);
  }

  private readStoredNotifications(): void {
    try {
      const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.items.set(parsed as AppNotification[]);
          return;
        }
      }
    } catch {
      // Swallowed
    }

    this.items.set(MOCK_INITIAL_NOTIFICATIONS);
    this.persistNotifications(MOCK_INITIAL_NOTIFICATIONS);
  }

  private persistNotifications(list: readonly AppNotification[]): void {
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(list));
    } catch {
      // Swallowed
    }
  }
}
