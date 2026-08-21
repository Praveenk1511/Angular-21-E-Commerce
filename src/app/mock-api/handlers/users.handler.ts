import type { User, UserRole, UserStatus } from '@core/models';
import { USER_SEEDS } from '@mock-data/index';

import type { MockApiConfig } from '../mock-api.config';
import { type MockRoute, notFound, ok } from '../mock-api.types';
import { matchesText, paginate, readPaging, sortBy } from '../mock-api.utils';
import { addressesForUser } from '../mock-db';

/**
 * User and address endpoints.
 *
 * There is deliberately no "current user" endpoint. Who is signed in is a question only
 * authentication can answer, and adding a `/users/me` that returns a hard-coded account
 * would invite features to be built on a fiction that has to be unpicked later.
 */
export function createUserRoutes(config: MockApiConfig): readonly MockRoute[] {
  return [
    {
      method: 'GET',
      path: '/users',
      handle: ({ query }) => {
        const { page, pageSize } = readPaging(query, config.defaultPageSize, config.maxPageSize);

        let users: readonly User[] = USER_SEEDS;

        const role = query['role'] as UserRole | undefined;
        if (role) {
          users = users.filter((user) => user.role === role);
        }

        const status = query['status'] as UserStatus | undefined;
        if (status) {
          users = users.filter((user) => user.status === status);
        }

        const term = query['q'];
        if (term) {
          users = users.filter((user) =>
            matchesText([user.firstName, user.lastName, user.email], term),
          );
        }

        const ordered = sortBy(users, (user) => `${user.lastName} ${user.firstName}`, 'asc');

        return ok(paginate(ordered, page, pageSize));
      },
    },

    {
      method: 'GET',
      path: '/users/:id',
      handle: ({ params }) => {
        const id = params['id'] ?? '';
        const user = USER_SEEDS.find((candidate) => candidate.id === id);

        if (!user) {
          throw notFound(`No user matches "${id}".`);
        }

        return ok(user);
      },
    },

    {
      method: 'GET',
      path: '/users/:id/addresses',
      handle: ({ params, query }) => {
        const id = params['id'] ?? '';

        if (!USER_SEEDS.some((candidate) => candidate.id === id)) {
          throw notFound(`No user matches "${id}".`);
        }

        const type = query['type'];
        const addresses = addressesForUser(id);

        // An empty array is a valid answer here, not a 404: the user exists and simply
        // has no saved addresses, which a checkout has to handle on its own terms.
        return ok(type ? addresses.filter((address) => address.type === type) : addresses);
      },
    },
  ];
}
