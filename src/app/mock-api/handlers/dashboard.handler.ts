import type {
  DashboardStats,
  MetricDelta,
  OrderStatus,
  OrderStatusCount,
  TimeSeriesPoint,
  TopSellingProduct,
} from '@core/models';
import { USER_SEEDS, type OrderSeed } from '@mock-data/index';

import { type MockRoute, ok } from '../mock-api.types';
import { percentChange, readInt, roundMinor } from '../mock-api.utils';
import { allInventoryRecords, allOrderSeeds, findProductSeed, toOrderSummary } from '../mock-db';

const DAY_MS = 86_400_000;
const DEFAULT_WINDOW_DAYS = 30;

/**
 * Statuses that represent money the business actually kept.
 *
 * An array rather than a `Set` so this module's top level stays free of executable
 * statements, which is what keeps the mock backend eliminable when switched off.
 */
const REVENUE_STATUSES: readonly OrderStatus[] = ['processing', 'shipped', 'delivered', 'on-hold'];

const ALL_STATUSES: readonly OrderStatus[] = [
  'pending',
  'processing',
  'on-hold',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
  'returned',
];

/**
 * Dashboard statistics, computed on request.
 *
 * Everything here is calculated from the same orders an admin can open and inspect,
 * rather than stored as fixed numbers. Hard-coded dashboard figures are the fastest way
 * to lose trust in a screen: the moment a headline total disagrees with the list below
 * it, a reader stops believing either.
 *
 * Cancelled, refunded and returned orders are excluded from revenue but still counted
 * in the status breakdown, because "how much did we make" and "what is in the pipeline"
 * are different questions.
 */
export function createDashboardRoutes(): readonly MockRoute[] {
  return [
    {
      method: 'GET',
      path: '/dashboard/stats',
      handle: ({ query }) => {
        const windowDays = Math.max(1, readInt(query['days']) ?? DEFAULT_WINDOW_DAYS);
        const now = Date.now();
        const currentFrom = now - windowDays * DAY_MS;
        const previousFrom = currentFrom - windowDays * DAY_MS;

        const orders = allOrderSeeds();
        const current = withinWindow(orders, currentFrom, now);
        const previous = withinWindow(orders, previousFrom, currentFrom);

        const stats: DashboardStats = {
          currency: 'INR',
          revenueMinor: delta(revenue(current), revenue(previous)),
          orderCount: delta(current.length, previous.length),
          averageOrderValueMinor: delta(averageOrderValue(current), averageOrderValue(previous)),
          newCustomerCount: delta(
            newCustomers(currentFrom, now),
            newCustomers(previousFrom, currentFrom),
          ),
          ordersByStatus: statusBreakdown(orders),
          revenueByDay: revenueByDay(orders, windowDays, now),
          topProducts: topProducts(orders),
          lowStockCount: allInventoryRecords().filter(
            (record) => record.available > 0 && record.available <= record.reorderLevel,
          ).length,
          outOfStockCount: allInventoryRecords().filter((record) => record.available === 0).length,
          generatedAt: new Date().toISOString(),
        };

        return ok(stats);
      },
    },
  ];
}

function withinWindow(
  orders: readonly OrderSeed[],
  fromMs: number,
  toMs: number,
): readonly OrderSeed[] {
  return orders.filter((order) => {
    const placed = Date.parse(order.placedAt);

    return placed >= fromMs && placed < toMs;
  });
}

function revenue(orders: readonly OrderSeed[]): number {
  return orders
    .filter((order) => REVENUE_STATUSES.includes(order.status))
    .reduce((total, order) => total + toOrderSummary(order).totals.grandTotalMinor, 0);
}

function averageOrderValue(orders: readonly OrderSeed[]): number {
  const earning = orders.filter((order) => REVENUE_STATUSES.includes(order.status));

  return earning.length === 0 ? 0 : roundMinor(revenue(orders) / earning.length);
}

function newCustomers(fromMs: number, toMs: number): number {
  return USER_SEEDS.filter((user) => {
    const created = Date.parse(user.createdAt);

    return user.role === 'customer' && created >= fromMs && created < toMs;
  }).length;
}

function delta(current: number, previous: number): MetricDelta {
  return { current, previous, changePercent: percentChange(current, previous) };
}

function statusBreakdown(orders: readonly OrderSeed[]): readonly OrderStatusCount[] {
  // Every status is listed, including the zeroes: a chart that silently drops empty
  // categories makes it impossible to see that nothing was refunded this month.
  return ALL_STATUSES.map((status) => ({
    status,
    count: orders.filter((order) => order.status === status).length,
  }));
}

function revenueByDay(
  orders: readonly OrderSeed[],
  windowDays: number,
  nowMs: number,
): readonly TimeSeriesPoint[] {
  const points: TimeSeriesPoint[] = [];

  for (let offset = windowDays - 1; offset >= 0; offset--) {
    const dayStart = startOfDay(nowMs - offset * DAY_MS);
    const dayEnd = dayStart + DAY_MS;

    points.push({
      date: new Date(dayStart).toISOString().slice(0, 10),
      value: revenue(withinWindow(orders, dayStart, dayEnd)),
    });
  }

  return points;
}

function startOfDay(ms: number): number {
  const date = new Date(ms);
  date.setUTCHours(0, 0, 0, 0);

  return date.getTime();
}

function topProducts(orders: readonly OrderSeed[]): readonly TopSellingProduct[] {
  const tally = new Map<string, { units: number; revenueMinor: number }>();

  for (const order of orders) {
    if (!REVENUE_STATUSES.includes(order.status)) {
      continue;
    }

    for (const line of order.lines) {
      const entry = tally.get(line.productId) ?? { units: 0, revenueMinor: 0 };

      tally.set(line.productId, {
        units: entry.units + line.quantity,
        revenueMinor: entry.revenueMinor + line.unitPriceMinor * line.quantity,
      });
    }
  }

  return [...tally.entries()]
    .map(([productId, entry]) => {
      const product = findProductSeed(productId);

      return {
        productId,
        name: product?.name ?? 'Unavailable product',
        slug: product?.slug ?? '',
        unitsSold: entry.units,
        revenueMinor: entry.revenueMinor,
      };
    })
    .sort((left, right) => right.revenueMinor - left.revenueMinor)
    .slice(0, 5);
}
