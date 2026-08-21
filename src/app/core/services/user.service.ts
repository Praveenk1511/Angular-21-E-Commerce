import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';

import type { Address, AddressType, Page, User, UserListQuery } from '@core/models';

import { ApiClient } from './api-client';

/**
 * User and address lookups.
 *
 * There is intentionally no `getCurrentUser()`. Identity comes from authentication, and
 * a method that returns a fixed "current" account would have features built on top of it
 * that all have to be revisited once sign-in is real.
 */
@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = inject(ApiClient);

  list(query: UserListQuery = {}): Observable<Page<User>> {
    return this.api.get<Page<User>>('/users', {
      page: query.page,
      pageSize: query.pageSize,
      q: query.q,
      role: query.role,
      status: query.status,
    });
  }

  get(userId: string): Observable<User> {
    return this.api.get<User>(`/users/${encodeURIComponent(userId)}`);
  }

  /** `GET /users/:id/addresses`. An empty list is a valid answer, not an error. */
  getAddresses(userId: string, type?: AddressType): Observable<readonly Address[]> {
    return this.api.get<readonly Address[]>(
      `/users/${encodeURIComponent(userId)}/addresses`,
      type === undefined ? undefined : { type },
    );
  }
}
