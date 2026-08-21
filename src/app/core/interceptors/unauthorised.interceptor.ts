import { HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { AuthStore } from '@state/auth.store';

/**
 * Handles 401 Unauthorized responses by ending the local session.
 *
 * When a server responds 401, the token is no longer valid — whether because it
 * expired, was revoked, or was never valid. Continuing to present it on subsequent
 * requests would only produce more 401s, so the correct reaction is to clear the
 * local session and send the user to the login page.
 *
 * Excludes the login/register endpoints themselves: a failed login is a 401 by design
 * (actually a 422 in our mock, but worth guarding against a real backend that returns
 * 401 for "wrong credentials"), and logging the user out of an already-nonexistent
 * session in response to a login attempt is nonsensical.
 *
 * This interceptor re-throws the error after acting, so the error-normalisation
 * interceptor still translates it into an `ApiRequestError` for the calling code.
 */
export const unauthorisedInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthStore);

  return next(request).pipe(
    catchError((error: unknown) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !isAuthEndpoint(request.url)
      ) {
        auth.logout();
      }

      return throwError(() => error);
    }),
  );
};

/** Auth endpoints should not trigger a session clear on failure. */
function isAuthEndpoint(url: string): boolean {
  return url.includes('/auth/login') || url.includes('/auth/register');
}
