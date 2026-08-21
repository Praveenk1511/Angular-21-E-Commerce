/**
 * Transport-level contracts shared by every data service.
 *
 * These types describe the *shape of an API*, not any business entity. Domain
 * models (catalog, cart, orders, users) are introduced by the phase that owns
 * them. Keeping the envelope separate means the mock API and a future real REST
 * backend can be swapped without touching feature code.
 */

/** Sort direction accepted by collection endpoints. */
export type SortDirection = 'asc' | 'desc';

/** One-based page selector for a collection endpoint. */
export interface PageRequest {
  /** First page is `1`, matching what a paginator shows the user. */
  readonly page: number;
  readonly pageSize: number;
}

/** Sort instruction for a collection endpoint. */
export interface SortRequest<TField extends string = string> {
  readonly field: TField;
  readonly direction: SortDirection;
}

/** Pagination metadata returned alongside a page of results. */
export interface PageMeta extends PageRequest {
  readonly totalItems: number;
  readonly totalPages: number;
  readonly hasPreviousPage: boolean;
  readonly hasNextPage: boolean;
}

/** A single page of a collection, plus the metadata needed to render a paginator. */
export interface Page<T> {
  readonly items: readonly T[];
  readonly meta: PageMeta;
}

/** A validation failure attached to a specific request field. */
export interface ApiFieldError {
  readonly field: string;
  readonly message: string;
}

/**
 * Normalised error surface.
 *
 * Whatever the transport failure looks like, services translate it into this
 * shape so UI layers never branch on `HttpErrorResponse` internals.
 */
export interface ApiError {
  /** HTTP status code, or `0` when the request never reached a server. */
  readonly status: number;
  /** Stable, machine-readable identifier such as `NOT_FOUND`. */
  readonly code: string;
  /** Message safe to display to an end user. */
  readonly message: string;
  readonly fieldErrors?: readonly ApiFieldError[];
}
