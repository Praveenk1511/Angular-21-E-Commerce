import { HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { APP_URLS } from '@core/config/route-paths';
import { AuthStore } from '@state/auth.store';

/**
 * Functional HTTP Auth Interceptor.
 *
 * Automatically injects HTTP `Authorization: Bearer <token>` header for authenticated requests,
 * intercepts 401 Unauthorized API responses (triggering session cleanup & login redirect),
 * and intercepts 403 Forbidden responses (redirecting to /unauthorized).
 *
 * ARCHITECTURE NOTE FOR REAL BACKEND INTEGRATION:
 * Client-side guards and interceptors manage UI routing and token injection for developer UX.
 * For production security with real JWT backends, all server API endpoints MUST perform stateless
 * token verification, claims validation, and database-level role permission authorization.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  const token = authStore.authToken();
  let authReq = req;

  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(authReq).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 401) {
          authStore.logout();
          void router.navigateByUrl(APP_URLS.auth.login);
        } else if (error.status === 403) {
          void router.navigateByUrl('/unauthorized');
        }
      }
      return throwError(() => error);
    }),
  );
};
