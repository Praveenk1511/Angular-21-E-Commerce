import { HttpContextToken, type HttpInterceptorFn } from '@angular/common/http';
import { timer, retry, type RetryConfig } from 'rxjs';

/**
 * Per-request opt-out: set to `false` in the request context to skip retry entirely.
 *
 * @example
 * this.http.get('/one-shot', { context: new HttpContext().set(RETRY_ENABLED, false) });
 */
export const RETRY_ENABLED = new HttpContextToken<boolean>(() => true);

/** Maximum number of retry attempts before surfacing the failure. */
export const RETRY_COUNT = new HttpContextToken<number>(() => 2);

/**
 * Retries transient failures with exponential backoff.
 *
 * A "transient" failure is one where repeating the same request has a reasonable
 * chance of success: network timeouts (status 0), 503 Service Unavailable, and
 * 429 Rate Limited (after waiting). Client errors (4xx other than 429) are never
 * retried because they will fail identically every time, and doing so would hammer
 * a server that already told us no.
 *
 * Backoff is exponential with jitter: base delay × 2^attempt, plus a random offset up
 * to 30% of the delay. Jitter prevents a thundering herd when many clients retry at
 * the same moment.
 *
 * The interceptor sits *inside* the loading interceptor so retries do not flash the
 * global loading indicator off and on between attempts.
 */
export const retryInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.context.get(RETRY_ENABLED)) {
    return next(request);
  }

  // Only retry requests to our own API.
  if (!request.url.startsWith('/api')) {
    return next(request);
  }

  // Mutations should generally not be retried: a POST that timed out may have
  // succeeded, and repeating it creates duplicates. GET (and HEAD/OPTIONS) are safe.
  if (request.method !== 'GET' && request.method !== 'HEAD' && request.method !== 'OPTIONS') {
    return next(request);
  }

  const maxRetries = request.context.get(RETRY_COUNT);
  const baseDelayMs = 800;

  const config: RetryConfig = {
    count: maxRetries,
    delay: (error: unknown, retryIndex: number) => {
      if (!isTransient(error)) {
        // Non-transient errors are re-thrown immediately without consuming a retry.
        throw error;
      }

      const exponential = baseDelayMs * Math.pow(2, retryIndex - 1);
      const jitter = Math.round(exponential * Math.random() * 0.3);

      return timer(exponential + jitter);
    },
  };

  return next(request).pipe(retry(config));
};

/**
 * Determines whether an error is worth retrying.
 *
 * Errors arrive here before the error-normalisation interceptor has converted them,
 * so they are still raw `HttpErrorResponse` objects or network failures. Checking the
 * `status` property directly is correct at this point in the chain.
 */
function isTransient(error: unknown): boolean {
  if (error === null || typeof error !== 'object') {
    return false;
  }

  const status = (error as { status?: number }).status;

  // Network failure: the request never reached a server.
  if (status === 0) {
    return true;
  }

  // 503 Service Unavailable and 504 Gateway Timeout: the server is temporarily down.
  if (status === 503 || status === 504) {
    return true;
  }

  // 429 Too Many Requests: the server told us to wait and try again.
  if (status === 429) {
    return true;
  }

  return false;
}
