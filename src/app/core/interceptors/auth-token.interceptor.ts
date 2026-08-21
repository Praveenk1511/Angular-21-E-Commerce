import type { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthStore } from '@state/auth.store';

/**
 * Attaches the Bearer token to every API request when a session is active.
 *
 * Skips requests that already carry an `Authorization` header — those are one-off
 * calls where the caller supplied a specific token (e.g. `GET /auth/me` during session
 * restore, which uses a token read from localStorage before the store is populated).
 *
 * Also skips requests whose URL does not start with the application's API base. This
 * prevents the token from leaking to third-party endpoints (analytics, CDN, etc.) that
 * Angular's HttpClient might also reach if a feature ever fetches non-API content.
 */
export const authTokenInterceptor: HttpInterceptorFn = (request, next) => {
  const token = inject(AuthStore).authToken();

  // Nothing to attach, or the caller already set a specific Authorization header.
  if (!token || request.headers.has('Authorization')) {
    return next(request);
  }

  // Only attach to our own API, never to third-party URLs.
  if (!request.url.startsWith('/api')) {
    return next(request);
  }

  const authenticatedRequest = request.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });

  return next(authenticatedRequest);
};
