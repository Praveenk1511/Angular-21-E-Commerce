import { InjectionToken } from '@angular/core';

/**
 * Forced behaviour for a single request, requested with a `scenario` query parameter.
 *
 * Randomly injected failures make a development environment untrustworthy — you never
 * know whether you broke something or the dice did. An explicit, per-request override
 * means empty and error states can be built deliberately and reproducibly:
 *
 * ```
 * GET /api/products?scenario=empty
 * GET /api/products?scenario=error
 * GET /api/products?scenario=slow
 * ```
 */
export type MockScenario = 'empty' | 'error' | 'slow' | 'not-found';

export const MOCK_SCENARIO_PARAM = 'scenario';

export interface MockApiConfig {
  /** Turn the fake backend off entirely, so requests reach the network. */
  readonly enabled: boolean;

  /** Minimum simulated round trip, in milliseconds. */
  readonly minLatencyMs: number;

  /** Maximum simulated round trip, in milliseconds. */
  readonly maxLatencyMs: number;

  /** Latency applied when `scenario=slow` is requested. */
  readonly slowLatencyMs: number;

  /**
   * Probability from 0 to 1 that any given request fails with a 503.
   *
   * Zero by default, on purpose. Useful to raise temporarily when testing retry
   * behaviour, harmful as a permanent setting.
   */
  readonly failureRate: number;

  /** Default page size when a request does not ask for one. */
  readonly defaultPageSize: number;

  /** Ceiling on `pageSize`, so a client cannot ask for the whole table. */
  readonly maxPageSize: number;
}

export const DEFAULT_MOCK_API_CONFIG: MockApiConfig = {
  enabled: true,
  minLatencyMs: 180,
  maxLatencyMs: 520,
  slowLatencyMs: 3200,
  failureRate: 0,
  defaultPageSize: 12,
  maxPageSize: 100,
};

export const MOCK_API_CONFIG = new InjectionToken<MockApiConfig>('MOCK_API_CONFIG', {
  factory: () => DEFAULT_MOCK_API_CONFIG,
});
