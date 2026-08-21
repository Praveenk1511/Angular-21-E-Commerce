import type { CurrencyCode } from './product.model';
import type { OrderStatus } from './order.model';

/** A single point on a dashboard chart. */
export interface TimeSeriesPoint {
  /** ISO 8601 date, no time component. */
  readonly date: string;
  readonly value: number;
}

/** A headline figure with its change against the preceding period. */
export interface MetricDelta {
  readonly current: number;
  readonly previous: number;
  /** Signed percentage change, to one decimal place. `null` when previous was zero. */
  readonly changePercent: number | null;
}

export interface TopSellingProduct {
  readonly productId: string;
  readonly name: string;
  readonly slug: string;
  readonly unitsSold: number;
  readonly revenueMinor: number;
}

export interface OrderStatusCount {
  readonly status: OrderStatus;
  readonly count: number;
}

/**
 * Aggregates for the admin dashboard.
 *
 * Computed on request from the underlying orders rather than stored as fixed numbers,
 * so the figures always agree with the order list a reader can drill into.
 */
export interface DashboardStats {
  readonly currency: CurrencyCode;
  readonly revenueMinor: MetricDelta;
  readonly orderCount: MetricDelta;
  readonly averageOrderValueMinor: MetricDelta;
  readonly newCustomerCount: MetricDelta;
  readonly ordersByStatus: readonly OrderStatusCount[];
  readonly revenueByDay: readonly TimeSeriesPoint[];
  readonly topProducts: readonly TopSellingProduct[];
  readonly lowStockCount: number;
  readonly outOfStockCount: number;
  /** ISO 8601 of when these figures were calculated. */
  readonly generatedAt: string;
}
