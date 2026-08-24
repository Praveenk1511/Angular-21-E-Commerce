import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { AdminChartComponent } from '@shared/components/admin-chart/admin-chart';
import { Badge } from '@shared/components/badge/badge';
import { AdminReportsStore } from '@state/admin-reports.store';

/**
 * Admin Analytics & Reporting Page (/admin/reports).
 *
 * Renders multi-timeframe analytics (Daily, Weekly, Monthly, Yearly), report category tabs
 * (Revenue, Sales, Orders, Customers, Products, Categories, Inventory), KPI Delta Cards,
 * and uses the modular AdminChartComponent abstraction (Line, Bar, Donut SVG charts).
 */
@Component({
  selector: 'app-admin-reports',
  imports: [
    AdminChartComponent,
    Badge,
  ],
  templateUrl: './admin-reports.html',
  styleUrl: './admin-reports.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminReports {
  protected readonly store = inject(AdminReportsStore);
}
