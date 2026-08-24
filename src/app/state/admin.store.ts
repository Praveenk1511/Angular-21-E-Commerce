import { Injectable, signal } from '@angular/core';

export type TimeRange = '7d' | '30d' | '90d' | '1y';

export interface SalesDataPoint {
  readonly label: string;
  readonly salesCount: number;
  readonly revenueMinor: number;
}

export interface CategoryRevenuePoint {
  readonly category: string;
  readonly percentage: number;
  readonly revenueMinor: number;
  readonly color: string;
}

export interface OrderStatusPoint {
  readonly status: string;
  readonly count: number;
  readonly percentage: number;
  readonly color: string;
}

export interface CustomerGrowthPoint {
  readonly period: string;
  readonly newCustomers: number;
  readonly returningCustomers: number;
}

export interface AdminRecentOrder {
  readonly id: string;
  readonly customerName: string;
  readonly date: string;
  readonly totalMinor: number;
  readonly status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered';
}

export interface AdminTopProduct {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly unitsSold: number;
  readonly revenueMinor: number;
  readonly stock: number;
}

/**
 * State store for Admin Portal dashboard metrics, analytics charts, and layout toggles.
 */
@Injectable({ providedIn: 'root' })
export class AdminStore {
  // ---------- Layout & Filter Signals ----------
  readonly sidebarCollapsed = signal<boolean>(false);
  readonly activeTimeRange = signal<TimeRange>('30d');

  // ---------- Metrics Signals ----------
  readonly totalRevenueMinor = signal<number>(12845000); // £128,450.00
  readonly revenueGrowthPct = signal<number>(14.2);

  readonly totalOrdersCount = signal<number>(1420);
  readonly ordersGrowthPct = signal<number>(8.5);

  readonly totalCustomersCount = signal<number>(890);
  readonly customersGrowthPct = signal<number>(12.1);

  readonly totalProductsCount = signal<number>(48);
  readonly pendingOrdersCount = signal<number>(12);
  readonly lowStockProductsCount = signal<number>(5);

  // ---------- Chart Data Signals ----------

  readonly salesChartData = signal<readonly SalesDataPoint[]>([
    { label: 'Mon', salesCount: 42, revenueMinor: 420000 },
    { label: 'Tue', salesCount: 58, revenueMinor: 680000 },
    { label: 'Wed', salesCount: 75, revenueMinor: 920000 },
    { label: 'Thu', salesCount: 64, revenueMinor: 790000 },
    { label: 'Fri', salesCount: 92, revenueMinor: 1250000 },
    { label: 'Sat', salesCount: 115, revenueMinor: 1580000 },
    { label: 'Sun', salesCount: 88, revenueMinor: 1100000 },
  ]);

  readonly revenueByCategoryData = signal<readonly CategoryRevenuePoint[]>([
    { category: 'Electronics', percentage: 42, revenueMinor: 5394900, color: '#2563eb' },
    { category: 'Audio Gear', percentage: 28, revenueMinor: 3596600, color: '#0d9488' },
    { category: 'Office Ergonomics', percentage: 18, revenueMinor: 2312100, color: '#8b5cf6' },
    { category: 'Accessories', percentage: 12, revenueMinor: 1541400, color: '#f59e0b' },
  ]);

  readonly orderStatusData = signal<readonly OrderStatusPoint[]>([
    { status: 'Delivered', count: 980, percentage: 69, color: '#16a34a' },
    { status: 'Processing', count: 240, percentage: 17, color: '#2563eb' },
    { status: 'Shipped', count: 120, percentage: 8, color: '#0d9488' },
    { status: 'Pending', count: 60, percentage: 4, color: '#f59e0b' },
    { status: 'Cancelled', count: 20, percentage: 2, color: '#ef4444' },
  ]);

  readonly customerGrowthData = signal<readonly CustomerGrowthPoint[]>([
    { period: 'Jan', newCustomers: 120, returningCustomers: 180 },
    { period: 'Feb', newCustomers: 145, returningCustomers: 210 },
    { period: 'Mar', newCustomers: 180, returningCustomers: 240 },
    { period: 'Apr', newCustomers: 210, returningCustomers: 280 },
    { period: 'May', newCustomers: 235, returningCustomers: 310 },
    { period: 'Jun', newCustomers: 270, returningCustomers: 350 },
  ]);

  readonly recentOrdersData = signal<readonly AdminRecentOrder[]>([
    { id: 'ORD-984102', customerName: 'Sarah Jenkins', date: '2026-08-24', totalMinor: 34999, status: 'delivered' },
    { id: 'ORD-652914', customerName: 'Marcus Vance', date: '2026-08-23', totalMinor: 19998, status: 'processing' },
    { id: 'ORD-441829', customerName: 'Elena Rostova', date: '2026-08-23', totalMinor: 7999, status: 'shipped' },
    { id: 'ORD-332910', customerName: 'Alex Morgan', date: '2026-08-22', totalMinor: 52998, status: 'pending' },
    { id: 'ORD-210492', customerName: 'Claire Bennett', date: '2026-08-22', totalMinor: 14999, status: 'delivered' },
  ]);

  readonly topProductsData = signal<readonly AdminTopProduct[]>([
    { id: 'prod-1', name: 'Ergonomic Desk Chair Pro', category: 'Furniture', unitsSold: 342, revenueMinor: 11969658, stock: 18 },
    { id: 'prod-3', name: 'Wireless Noise-Cancelling Headphones', category: 'Audio', unitsSold: 289, revenueMinor: 7224711, stock: 45 },
    { id: 'prod-2', name: 'Precision Wireless Mouse', category: 'Peripherals', unitsSold: 215, revenueMinor: 1719785, stock: 4 },
    { id: 'prod-4', name: 'Ultra-Wide 34" Curved Monitor', category: 'Displays', unitsSold: 148, revenueMinor: 10359852, stock: 2 },
  ]);

  // ---------- Actions ----------

  toggleSidebar(): void {
    this.sidebarCollapsed.update((v) => !v);
  }

  setTimeRange(range: TimeRange): void {
    this.activeTimeRange.set(range);
  }
}
