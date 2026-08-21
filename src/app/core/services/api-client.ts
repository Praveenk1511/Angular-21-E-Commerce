import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';

import { APP_CONFIG } from '@core/config/app-config';

/** Query values a caller may supply. `undefined` and `null` entries are dropped. */
export type ApiQuery = Readonly<
  Record<string, string | number | boolean | readonly string[] | null | undefined>
>;

/**
 * Thin wrapper over `HttpClient`.
 *
 * Not an abstraction layer — it does not hide HTTP, and it returns the same
 * `Observable` that `HttpClient` does. It exists for two small jobs that would otherwise
 * be copied into every service:
 *
 * 1. joining the configured base URL to a path, so the backend location lives in one
 *    place and moving it is a configuration change;
 * 2. serialising query objects, dropping absent values rather than sending
 *    `?minRating=undefined`.
 *
 * That second point matters more than it looks. Filter state is usually a partially
 * filled object, and letting `undefined` reach the wire produces requests that a real
 * backend will reject in ways the mock might tolerate.
 */
@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(APP_CONFIG).apiBaseUrl;

  get<T>(path: string, query?: ApiQuery): Observable<T> {
    return this.http.get<T>(this.url(path), { params: toHttpParams(query) });
  }

  /** GET with additional headers (e.g. Authorization). */
  getWithHeaders<T>(
    path: string,
    query: ApiQuery | undefined,
    headers: Readonly<Record<string, string>>,
  ): Observable<T> {
    return this.http.get<T>(this.url(path), {
      params: toHttpParams(query),
      headers: new HttpHeaders(headers),
    });
  }

  post<T>(path: string, body: unknown, query?: ApiQuery): Observable<T> {
    return this.http.post<T>(this.url(path), body, { params: toHttpParams(query) });
  }

  patch<T>(path: string, body: unknown): Observable<T> {
    return this.http.patch<T>(this.url(path), body);
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(this.url(path));
  }

  private url(path: string): string {
    return `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  }
}

function toHttpParams(query: ApiQuery | undefined): HttpParams {
  let params = new HttpParams();

  if (!query) {
    return params;
  }

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') {
      continue;
    }

    if (Array.isArray(value)) {
      // Empty arrays must not become `?tags=`, which a backend would read as one blank
      // tag rather than as no filter at all.
      if (value.length > 0) {
        params = params.set(key, value.join(','));
      }
      continue;
    }

    params = params.set(key, String(value));
  }

  return params;
}
