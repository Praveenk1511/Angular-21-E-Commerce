import {
  HttpErrorResponse,
  type HttpEvent,
  type HttpInterceptorFn,
  type HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { type Observable, delay, of, throwError } from 'rxjs';

import type { ApiError, ApiFieldError } from '@core/models';
import { APP_CONFIG } from '@core/config/app-config';

import {
  MOCK_API_CONFIG,
  MOCK_SCENARIO_PARAM,
  type MockApiConfig,
  type MockScenario,
} from './mock-api.config';
import { MockApiError, type MockRequestContext } from './mock-api.types';
import { createMockRoutes } from './handlers';
import { randomLatency } from './mock-api.utils';

/**
 * A fake REST backend, installed as an HTTP interceptor.
 *
 * This is the central architectural decision of the mock layer, and it is worth being
 * explicit about the alternative. The obvious approach is to write `MockProductService`
 * classes behind an interface and swap the provider later. That works, but it means
 * every service is thrown away and rewritten when the real backend lands, and until
 * then nothing in the application ever exercises HTTP: no status codes, no
 * `HttpErrorResponse`, no query serialisation, no interceptor chain.
 *
 * Intercepting instead means services are written against `HttpClient` from the first
 * day and are already finished. Retiring the mock is deleting one entry from the
 * interceptor array in `app.config.ts` — no service, store or component changes at all.
 *
 * What is faithfully simulated:
 *
 * - real `HttpResponse` objects with real status codes;
 * - real `HttpErrorResponse` failures, so the error path is genuinely exercised;
 * - network latency, so loading states are visible rather than theoretical;
 * - 404 for missing resources, 400 for malformed queries, 409 for conflicts,
 *   422 with field-level detail for rejected payloads.
 */
export const mockApiInterceptor: HttpInterceptorFn = (request, next) => {
  const config = inject(MOCK_API_CONFIG);
  const baseUrl = inject(APP_CONFIG).apiBaseUrl;

  if (!config.enabled || !request.url.startsWith(baseUrl)) {
    return next(request);
  }

  const path = stripQuery(request.url.slice(baseUrl.length)) || '/';
  const query = readQuery(request);
  const scenario = readScenario(query[MOCK_SCENARIO_PARAM]);

  return dispatch(request, path, query, scenario, config);
};

function dispatch(
  request: HttpRequest<unknown>,
  path: string,
  query: Readonly<Record<string, string>>,
  scenario: MockScenario | null,
  config: MockApiConfig,
): Observable<HttpEvent<unknown>> {
  const latency =
    scenario === 'slow'
      ? config.slowLatencyMs
      : randomLatency(config.minLatencyMs, config.maxLatencyMs);

  // Forced failures come first: they must not depend on a route existing.
  if (scenario === 'error') {
    return fail(request, 500, 'SIMULATED_FAILURE', 'Simulated server error.', latency);
  }

  if (scenario === 'not-found') {
    return fail(request, 404, 'NOT_FOUND', 'Simulated missing resource.', latency);
  }

  if (config.failureRate > 0 && Math.random() < config.failureRate) {
    return fail(
      request,
      503,
      'SERVICE_UNAVAILABLE',
      'The service is temporarily unavailable.',
      latency,
    );
  }

  const match = matchRoute(request.method, path, config);

  if (!match) {
    return fail(
      request,
      404,
      'ROUTE_NOT_FOUND',
      `No mock endpoint handles ${request.method} ${path}.`,
      latency,
    );
  }

  const context: MockRequestContext = {
    params: match.params,
    query,
    body: request.body,
    request,
  };

  try {
    const result = match.route.handle(context);
    const body = scenario === 'empty' ? emptyOut(result.body) : result.body;

    return of(new HttpResponse({ status: result.status, body, url: request.url })).pipe(
      delay(latency),
    );
  } catch (error) {
    if (error instanceof MockApiError) {
      return fail(request, error.status, error.code, error.message, latency, error.fieldErrors);
    }

    // A genuine bug in a handler, not a simulated failure. Surface it as a 500 rather
    // than letting it escape as an unhandled exception with no HTTP shape.
    return fail(
      request,
      500,
      'MOCK_HANDLER_ERROR',
      error instanceof Error ? error.message : 'Unknown mock handler failure.',
      latency,
    );
  }
}

/**
 * Blank out a paged payload for `scenario=empty`.
 *
 * Handled generically here rather than in each handler: any response carrying `items`
 * and `meta` can be emptied the same way, and the alternative is an `if (empty)` branch
 * duplicated across every list endpoint.
 */
function emptyOut(body: unknown): unknown {
  if (body === null || typeof body !== 'object') {
    return body;
  }

  if (Array.isArray(body)) {
    return [];
  }

  const record = body as Record<string, unknown>;

  if (!Array.isArray(record['items'])) {
    return body;
  }

  return {
    ...record,
    items: [],
    meta: {
      ...(record['meta'] as Record<string, unknown>),
      totalItems: 0,
      totalPages: 0,
      hasPreviousPage: false,
      hasNextPage: false,
    },
  };
}

function fail(
  request: HttpRequest<unknown>,
  status: number,
  code: string,
  message: string,
  latencyMs: number,
  fieldErrors?: readonly ApiFieldError[],
): Observable<never> {
  const error: ApiError = {
    status,
    code,
    message,
    ...(fieldErrors && fieldErrors.length > 0 ? { fieldErrors } : {}),
  };

  return throwError(
    () =>
      new HttpErrorResponse({
        status,
        statusText: code,
        url: request.url,
        error,
      }),
  ).pipe(delay(latencyMs));
}

interface RouteMatch {
  readonly route: ReturnType<typeof createMockRoutes>[number];
  readonly params: Readonly<Record<string, string>>;
}

/**
 * Routes are built once per config object, not per request.
 *
 * Created lazily rather than at module scope on purpose. A top-level `new WeakMap()` is
 * an observable side effect as far as the bundler is concerned, which prevents this
 * module — and, transitively, every handler and the whole seed data folder — from being
 * dropped when `ngUseMockApi` is false. Keeping the module's top level pure is what makes
 * that elimination possible.
 */
let routeCache: WeakMap<MockApiConfig, ReturnType<typeof createMockRoutes>> | null = null;

function matchRoute(method: string, path: string, config: MockApiConfig): RouteMatch | null {
  routeCache ??= new WeakMap<MockApiConfig, ReturnType<typeof createMockRoutes>>();

  let routes = routeCache.get(config);

  if (!routes) {
    routes = createMockRoutes(config);
    routeCache.set(config, routes);
  }

  const segments = split(path);

  for (const route of routes) {
    if (route.method !== method) {
      continue;
    }

    const params = matchSegments(split(route.path), segments);

    if (params) {
      return { route, params };
    }
  }

  return null;
}

/** Match a pattern against a path, capturing `:name` segments. */
function matchSegments(
  pattern: readonly string[],
  actual: readonly string[],
): Readonly<Record<string, string>> | null {
  if (pattern.length !== actual.length) {
    return null;
  }

  const params: Record<string, string> = {};

  for (const [index, expected] of pattern.entries()) {
    const received = actual[index] ?? '';

    if (expected.startsWith(':')) {
      params[expected.slice(1)] = decodeURIComponent(received);
      continue;
    }

    if (expected !== received) {
      return null;
    }
  }

  return params;
}

function split(path: string): readonly string[] {
  return path.split('/').filter((segment) => segment.length > 0);
}

function stripQuery(url: string): string {
  const index = url.indexOf('?');

  return index === -1 ? url : url.slice(0, index);
}

/** Flatten `HttpParams` into a plain record, joining repeated keys with commas. */
function readQuery(request: HttpRequest<unknown>): Readonly<Record<string, string>> {
  const query: Record<string, string> = {};

  for (const key of request.params.keys()) {
    query[key] = request.params.getAll(key)?.join(',') ?? '';
  }

  return query;
}

function readScenario(value: string | undefined): MockScenario | null {
  const allowed: readonly MockScenario[] = ['empty', 'error', 'slow', 'not-found'];

  return allowed.find((scenario) => scenario === value) ?? null;
}
