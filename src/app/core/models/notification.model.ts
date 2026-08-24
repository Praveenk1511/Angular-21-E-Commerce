export type NotificationKind = 'order' | 'payment' | 'account' | 'promotion' | 'system' | 'stock' | 'price-drop';

export type NotificationSeverity = 'info' | 'success' | 'warning' | 'error';

export interface AppNotification {
  readonly id: string;
  readonly userId: string;
  readonly kind: NotificationKind;
  readonly severity: NotificationSeverity;
  readonly title: string;
  readonly body: string;
  /** ISO 8601. */
  readonly createdAt: string;
  readonly readAt: string | null;
  /** In-app route this notification points at, or `null` if it is informational. */
  readonly actionUrl: string | null;
}

export interface NotificationListQuery {
  readonly page?: number;
  readonly pageSize?: number;
  readonly userId?: string;
  readonly unreadOnly?: boolean;
  readonly kind?: NotificationKind;
}

/** List responses include the unread tally so a badge needs no second request. */
export interface NotificationUnreadCount {
  readonly unreadCount: number;
}
