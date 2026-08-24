import { Injectable, computed, signal } from '@angular/core';

export type ReportTimeframe = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type ReportTab = 'overview' | 'revenue' | 'orders' | 'customers' | 'products' | 'categories' | 'inventory';

export interface ChartPoint {
  readonly label: string;
  readonly value: number;
  readonly formattedValue?: string;
  readonly color?: string;
}

export interface MetricCard {
  readonly title: string;
  readonly value: string;
  readonly changePct: number;
  readonly isPositive: boolean;
}

/**
 * Root state manager for Admin Analytics, Timeframe granularity filtering (Daily, Weekly, Monthly, Yearly),
 * and modular reporting chart datasets.
 */
@Injectable({ providedIn: 'root' })
export class AdminReportsStore {
  readonly timeframe = signal<ReportTimeframe>('monthly');
  readonly activeTab = signal<ReportTab>('overview');

  // ---------- Derived Timeframe Datasets ----------

  readonly revenueData = computed<readonly ChartPoint[]>(() => {
    switch (this.timeframe()) {
      case 'daily':
        return [
          { label: 'Mon', value: 1200, formattedValue: '£1,200' },
          { label: 'Tue', value: 1850, formattedValue: '£1,850' },
          { label: 'Wed', value: 2400, formattedValue: '£2,400' },
          { label: 'Thu', value: 2100, formattedValue: '£2,100' },
          { label: 'Fri', value: 3200, formattedValue: '£3,200' },
          { label: 'Sat', value: 4100, formattedValue: '£4,100' },
          { label: 'Sun', value: 3800, formattedValue: '£3,800' },
        ];
      case 'weekly':
        return [
          { label: 'Week 1', value: 14200, formattedValue: '£14.2k' },
          { label: 'Week 2', value: 18500, formattedValue: '£18.5k' },
          { label: 'Week 3', value: 22400, formattedValue: '£22.4k' },
          { label: 'Week 4', value: 26100, formattedValue: '£26.1k' },
        ];
      case 'yearly':
        return [
          { label: '2022', value: 280000, formattedValue: '£280k' },
          { label: '2023', value: 410000, formattedValue: '£410k' },
          { label: '2024', value: 590000, formattedValue: '£590k' },
          { label: '2025', value: 780000, formattedValue: '£780k' },
          { label: '2026', value: 950000, formattedValue: '£950k' },
        ];
      case 'monthly':
      default:
        return [
          { label: 'Jan', value: 32000, formattedValue: '£32k' },
          { label: 'Feb', value: 38000, formattedValue: '£38k' },
          { label: 'Mar', value: 45000, formattedValue: '£45k' },
          { label: 'Apr', value: 42000, formattedValue: '£42k' },
          { label: 'May', value: 52000, formattedValue: '£52k' },
          { label: 'Jun', value: 61000, formattedValue: '£61k' },
          { label: 'Jul', value: 58000, formattedValue: '£58k' },
          { label: 'Aug', value: 64000, formattedValue: '£64k' },
          { label: 'Sep', value: 70000, formattedValue: '£70k' },
          { label: 'Oct', value: 78000, formattedValue: '£78k' },
          { label: 'Nov', value: 95000, formattedValue: '£95k' },
          { label: 'Dec', value: 120000, formattedValue: '£120k' },
        ];
    }
  });

  readonly ordersData = computed<readonly ChartPoint[]>(() => {
    switch (this.timeframe()) {
      case 'daily':
        return [
          { label: 'Mon', value: 12, formattedValue: '12 orders' },
          { label: 'Tue', value: 18, formattedValue: '18 orders' },
          { label: 'Wed', value: 24, formattedValue: '24 orders' },
          { label: 'Thu', value: 21, formattedValue: '21 orders' },
          { label: 'Fri', value: 32, formattedValue: '32 orders' },
          { label: 'Sat', value: 41, formattedValue: '41 orders' },
          { label: 'Sun', value: 38, formattedValue: '38 orders' },
        ];
      case 'weekly':
        return [
          { label: 'W1', value: 142, formattedValue: '142 orders' },
          { label: 'W2', value: 185, formattedValue: '185 orders' },
          { label: 'W3', value: 224, formattedValue: '224 orders' },
          { label: 'W4', value: 261, formattedValue: '261 orders' },
        ];
      case 'yearly':
        return [
          { label: '2022', value: 2800, formattedValue: '2.8k' },
          { label: '2023', value: 4100, formattedValue: '4.1k' },
          { label: '2024', value: 5900, formattedValue: '5.9k' },
          { label: '2025', value: 7800, formattedValue: '7.8k' },
          { label: '2026', value: 9500, formattedValue: '9.5k' },
        ];
      case 'monthly':
      default:
        return [
          { label: 'Jan', value: 320, formattedValue: '320' },
          { label: 'Feb', value: 380, formattedValue: '380' },
          { label: 'Mar', value: 450, formattedValue: '450' },
          { label: 'Apr', value: 420, formattedValue: '420' },
          { label: 'May', value: 520, formattedValue: '520' },
          { label: 'Jun', value: 610, formattedValue: '610' },
          { label: 'Jul', value: 580, formattedValue: '580' },
          { label: 'Aug', value: 640, formattedValue: '640' },
          { label: 'Sep', value: 700, formattedValue: '700' },
          { label: 'Oct', value: 780, formattedValue: '780' },
          { label: 'Nov', value: 950, formattedValue: '950' },
          { label: 'Dec', value: 1200, formattedValue: '1,200' },
        ];
    }
  });

  readonly topProductsData = computed<readonly ChartPoint[]>(() => [
    { label: 'Desk Chair Pro', value: 142, formattedValue: '142 units (£49.7k)', color: '#2563eb' },
    { label: 'Wireless Mouse', value: 218, formattedValue: '218 units (£17.4k)', color: '#10b981' },
    { label: 'ANC Headphones', value: 95, formattedValue: '95 units (£23.7k)', color: '#f59e0b' },
    { label: '34" Curved Monitor', value: 42, formattedValue: '42 units (£29.4k)', color: '#8b5cf6' },
    { label: 'Tactile Keyboard', value: 88, formattedValue: '88 units (£11.4k)', color: '#ec4899' },
  ]);

  readonly topCategoriesData = computed<readonly ChartPoint[]>(() => [
    { label: 'Electronics & Workstation', value: 45, formattedValue: '45% (£427k)', color: '#2563eb' },
    { label: 'Furniture & Home', value: 30, formattedValue: '30% (£285k)', color: '#10b981' },
    { label: 'Audio & Sound', value: 15, formattedValue: '15% (£142k)', color: '#f59e0b' },
    { label: 'Accessories & Cables', value: 10, formattedValue: '10% (£95k)', color: '#8b5cf6' },
  ]);

  readonly customerGrowthData = computed<readonly ChartPoint[]>(() => [
    { label: 'Q1', value: 420, formattedValue: '420 users' },
    { label: 'Q2', value: 680, formattedValue: '680 users' },
    { label: 'Q3', value: 950, formattedValue: '950 users' },
    { label: 'Q4', value: 1340, formattedValue: '1.3k users' },
  ]);

  readonly inventoryHealthData = computed<readonly ChartPoint[]>(() => [
    { label: 'In Stock SKUs', value: 42, formattedValue: '42 items', color: '#16a34a' },
    { label: 'Low Stock Alerts', value: 6, formattedValue: '6 items', color: '#d97706' },
    { label: 'Out of Stock', value: 3, formattedValue: '3 items', color: '#ef4444' },
  ]);

  readonly metricsSummary = computed<readonly MetricCard[]>(() => [
    { title: 'Total Revenue', value: '£755,000', changePct: 18.4, isPositive: true },
    { title: 'Total Orders', value: '7,150', changePct: 12.1, isPositive: true },
    { title: 'Avg Order Value', value: '£105.59', changePct: 5.2, isPositive: true },
    { title: 'Customer Signups', value: '3,390', changePct: 24.0, isPositive: true },
  ]);

  // ---------- Actions ----------

  setTimeframe(tf: ReportTimeframe): void {
    this.timeframe.set(tf);
  }

  setActiveTab(tab: ReportTab): void {
    this.activeTab.set(tab);
  }
}
