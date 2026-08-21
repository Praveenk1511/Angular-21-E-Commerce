import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';

import type { AppNotification, NotificationListQuery, Page } from '@core/models';

import { ApiClient } from './api-client';

/** Notification list response: a page plus the unread total for a badge. */
export interface NotificationListResult extends Page<AppNotification> {
  readonly unreadCount: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly api = inject(ApiClient);

  /**
   * `GET /notifications`.
   *
   * `unreadCount` counts everything unread, not just the current page, so a badge does
   * not change when the reader turns a page.
   */
  list(query: NotificationListQuery = {}): Observable<NotificationListResult> {
    return this.api.get<NotificationListResult>('/notifications', {
      page: query.page,
      pageSize: query.pageSize,
      userId: query.userId,
      unreadOnly: query.unreadOnly,
      kind: query.kind,
    });
  }

  /** `PATCH /notifications/:id/read`. */
  markRead(notificationId: string): Observable<AppNotification> {
    return this.api.patch<AppNotification>(
      `/notifications/${encodeURIComponent(notificationId)}/read`,
      {},
    );
  }

  /** `POST /notifications/read-all`. Returns 204, so the observable yields nothing. */
  markAllRead(userId?: string): Observable<void> {
    return this.api.post<void>('/notifications/read-all', userId === undefined ? {} : { userId });
  }
}
