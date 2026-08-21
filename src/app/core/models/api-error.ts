import type { ApiError, ApiFieldError } from './api.model';

/**
 * The single error type callers of the data layer have to handle.
 *
 * A real `Error` subclass rather than a plain object, so it keeps a stack trace, is
 * recognisable with `instanceof`, and reads sensibly if it ever reaches a console or
 * an error reporter.
 *
 * Produced by the error-normalisation interceptor. Nothing above the interceptor sees
 * `HttpErrorResponse`, which means stores and components never branch on transport
 * details, and swapping the mock backend for a real one cannot change the error shape
 * they were written against.
 */
export class ApiRequestError extends Error implements ApiError {
  readonly status: number;
  readonly code: string;
  readonly fieldErrors?: readonly ApiFieldError[];

  constructor(error: ApiError) {
    super(error.message);

    this.name = 'ApiRequestError';
    this.status = error.status;
    this.code = error.code;

    if (error.fieldErrors) {
      this.fieldErrors = error.fieldErrors;
    }
  }

  /** True when the request never reached a server. */
  get isNetworkError(): boolean {
    return this.status === 0;
  }

  get isUnauthorised(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isConflict(): boolean {
    return this.status === 409;
  }

  /** True when the payload was rejected and {@link fieldErrors} may explain why. */
  get isValidationError(): boolean {
    return this.status === 422 || this.status === 400;
  }

  get isServerError(): boolean {
    return this.status >= 500;
  }

  /** True for errors that are likely to resolve by trying again. */
  get isTransient(): boolean {
    return this.status === 0 || this.status === 429 || this.status === 503 || this.status === 504;
  }
}
