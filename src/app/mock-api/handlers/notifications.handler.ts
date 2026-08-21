import type { AppNotification, NotificationKind, Page } from '@core/models';
import { NOTIFICATION_SEEDS } from '@mock-data/index';

import type { MockApiConfig } from '../mock-api.config';
import { type MockRoute, noContent, notFound, ok } from '../mock-api.types';
import { paginate, readBool, readPaging, sortBy } from '../mock-api.utils';

/**
 * Read receipts recorded during this session.
 *
 * Kept as a set of ids overlaid on the seeds rather than by mutating them, so the
 * fixture stays pristine and a reload returns to a known state. A PATCH is still
 * observable by the next GET, which is what the UI needs to be built against.
 */
let readIds: Set<string> | null = null;

/** Created on first use, so this module's top level stays side-effect free. */
function readReceipts(): Set<string> {
  readIds ??= new Set<string>();

  return readIds;
}

interface NotificationListResponse extends Page<AppNotification> {
  readonly unreadCount: number;
}

export function createNotificationRoutes(config: MockApiConfig): readonly MockRoute[] {
  return [
    {
      method: 'GET',
      path: '/notifications',
      handle: ({ query }) => {
        const { page, pageSize } = readPaging(query, config.defaultPageSize, config.maxPageSize);

        let notifications = withReadState(NOTIFICATION_SEEDS);

        const userId = query['userId'];
        if (userId) {
          notifications = notifications.filter((notification) => notification.userId === userId);
        }

        const kind = query['kind'] as NotificationKind | undefined;
        if (kind) {
          notifications = notifications.filter((notification) => notification.kind === kind);
        }

        // Counted before the unread filter narrows the list, so a badge shows the true
        // total rather than the size of the page currently on screen.
        const unreadCount = notifications.filter(
          (notification) => notification.readAt === null,
        ).length;

        if (readBool(query['unreadOnly']) === true) {
          notifications = notifications.filter((notification) => notification.readAt === null);
        }

        const ordered = sortBy(
          notifications,
          (notification) => Date.parse(notification.createdAt),
          'desc',
        );

        const response: NotificationListResponse = {
          ...paginate(ordered, page, pageSize),
          unreadCount,
        };

        return ok(response);
      },
    },

    {
      method: 'PATCH',
      path: '/notifications/:id/read',
      handle: ({ params }) => {
        const id = params['id'] ?? '';
        const notification = NOTIFICATION_SEEDS.find((candidate) => candidate.id === id);

        if (!notification) {
          throw notFound(`No notification matches "${id}".`);
        }

        readReceipts().add(id);

        return ok({ ...notification, readAt: notification.readAt ?? new Date().toISOString() });
      },
    },

    {
      method: 'POST',
      path: '/notifications/read-all',
      handle: ({ body }) => {
        const payload = (body ?? {}) as Record<string, unknown>;
        const userId = payload['userId'] === undefined ? null : String(payload['userId']);

        for (const notification of NOTIFICATION_SEEDS) {
          if (userId === null || notification.userId === userId) {
            readReceipts().add(notification.id);
          }
        }

        return noContent();
      },
    },
  ];
}

function withReadState(notifications: readonly AppNotification[]): readonly AppNotification[] {
  return notifications.map((notification) =>
    readReceipts().has(notification.id) && notification.readAt === null
      ? { ...notification, readAt: new Date().toISOString() }
      : notification,
  );
}
