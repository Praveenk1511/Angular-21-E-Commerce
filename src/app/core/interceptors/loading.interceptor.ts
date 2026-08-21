import type { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';

import { LoadingService } from '@core/services/loading.service';

/**
 * Tracks every in-flight API request in the {@link LoadingService}.
 *
 * `finalize` fires on both success and error, so the counter cannot drift even when
 * requests are cancelled or fail. The interceptor sits close to the outermost position
 * so it counts retries as a single logical request rather than one per attempt.
 */
export const loadingInterceptor: HttpInterceptorFn = (request, next) => {
  // Only count requests to our own API. Third-party fetches (fonts, analytics)
  // should not trigger the application-level loading indicator.
  if (!request.url.startsWith('/api')) {
    return next(request);
  }

  const loading = inject(LoadingService);
  loading.increment();

  return next(request).pipe(finalize(() => loading.decrement()));
};
