import type { HttpRequest } from '@angular/common/http';

import type { ApiFieldError } from '@core/models';

/** Everything a handler needs about the incoming request. */
export interface MockRequestContext {
  /** Values captured from the route pattern, e.g. `:id`. */
  readonly params: Readonly<Record<string, string>>;
  /** Query string, already decoded. Repeated keys arrive as a comma-joined string. */
  readonly query: Readonly<Record<string, string>>;
  readonly body: unknown;
  readonly request: HttpRequest<unknown>;
}

/** A successful response from a handler. */
export interface MockResponse {
  readonly status: number;
  readonly body: unknown;
}

export type MockHandler = (context: MockRequestContext) => MockResponse;

export interface MockRoute {
  readonly method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  /**
   * Path pattern relative to the API base, with `:name` segments.
   * For example `/products/:idOrSlug/reviews`.
   */
  readonly path: string;
  readonly handle: MockHandler;
}

/**
 * Thrown by a handler to produce an error response.
 *
 * Handlers signal failure by throwing rather than returning a status, so the happy
 * path in each handler stays free of error plumbing and an unhandled edge case cannot
 * accidentally be returned as a 200.
 */
export class MockApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fieldErrors?: readonly ApiFieldError[],
  ) {
    super(message);
    this.name = 'MockApiError';
  }
}

export const notFound = (message: string): MockApiError =>
  new MockApiError(404, 'NOT_FOUND', message);

export const badRequest = (message: string): MockApiError =>
  new MockApiError(400, 'BAD_REQUEST', message);

export const conflict = (code: string, message: string): MockApiError =>
  new MockApiError(409, code, message);

export const unprocessable = (
  message: string,
  fieldErrors: readonly ApiFieldError[],
): MockApiError => new MockApiError(422, 'VALIDATION_FAILED', message, fieldErrors);

export const ok = (body: unknown): MockResponse => ({ status: 200, body });

export const created = (body: unknown): MockResponse => ({ status: 201, body });

export const noContent = (): MockResponse => ({ status: 204, body: null });
