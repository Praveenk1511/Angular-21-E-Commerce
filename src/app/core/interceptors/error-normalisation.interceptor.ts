import { HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

import type { ApiError } from '@core/models';
import { ApiRequestError } from '@core/models';

/**
 * Translate every transport failure into a single {@link ApiRequestError}.
 *
 * Without this, error handling leaks upwards: each store and component ends up
 * inspecting `HttpErrorResponse`, guessing whether `error.error` holds a parsed body or
 * a `ProgressEvent`, and re-deriving whether a status counts as "not found". Doing it
 * once here means the rest of the application handles exactly one error type.
 *
 * It also protects the swap to a real backend. A real server's error body will not look
 * like the mock's, but the shape everything above this line was written against does not
 * change — only this translation does.
 */
export const errorNormalisationInterceptor: HttpInterceptorFn = (request, next) =>
  next(request).pipe(
    catchError((error: unknown) => throwError(() => normalise(error, request.url))),
  );

function normalise(error: unknown, url: string): ApiRequestError {
  // Already normalised, e.g. by a nested interceptor. Do not double-wrap.
  if (error instanceof ApiRequestError) {
    return error;
  }

  if (!(error instanceof HttpErrorResponse)) {
    return new ApiRequestError({
      status: 0,
      code: 'UNKNOWN',
      message: error instanceof Error ? error.message : 'An unexpected error occurred.',
    });
  }

  /*
   * Status 0 means the request never completed — offline, DNS failure, CORS rejection.
   * There is no server response to read, and the browser deliberately withholds the
   * reason, so a generic message is the honest one.
   */
  if (error.status === 0) {
    return new ApiRequestError({
      status: 0,
      code: 'NETWORK_ERROR',
      message: 'Could not reach the server. Check your connection and try again.',
    });
  }

  const body = error.error as Partial<ApiError> | string | null;

  if (body !== null && typeof body === 'object' && typeof body.message === 'string') {
    return new ApiRequestError({
      status: body.status ?? error.status,
      code: body.code ?? fallbackCode(error.status),
      message: body.message,
      ...(body.fieldErrors ? { fieldErrors: body.fieldErrors } : {}),
    });
  }

  return new ApiRequestError({
    status: error.status,
    code: fallbackCode(error.status),
    message: messageForStatus(error.status, url),
  });
}

function fallbackCode(status: number): string {
  switch (status) {
    case 400:
      return 'BAD_REQUEST';
    case 401:
      return 'UNAUTHORISED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 409:
      return 'CONFLICT';
    case 422:
      return 'VALIDATION_FAILED';
    case 429:
      return 'RATE_LIMITED';
    default:
      return status >= 500 ? 'SERVER_ERROR' : 'REQUEST_FAILED';
  }
}

/** Messages are written for a person to read, not for a log file. */
function messageForStatus(status: number, url: string): string {
  switch (status) {
    case 401:
      return 'You need to sign in to do that.';
    case 403:
      return 'You do not have permission to do that.';
    case 404:
      return 'The information you asked for could not be found.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    default:
      return status >= 500
        ? 'Something went wrong on our side. Please try again shortly.'
        : `The request to ${url} failed.`;
  }
}
