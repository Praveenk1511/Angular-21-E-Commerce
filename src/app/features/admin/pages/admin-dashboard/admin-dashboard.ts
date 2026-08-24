import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { TimeRange } from '@state/admin.store';
import { Badge, type BadgeVariant } from '@shared/components/badge/badge';
import { Icon } from '@shared/components/icon/icon';
import { PricePipe } from '@shared/pipes/price.pipe';
import { AdminStore } from '@state/admin.store';

/**
 * Admin Overview Dashboard Page (/admin/dashboard).
 */
@Component({
  selector: 'app-admin-dashboard',
  imports: [
    RouterLink,
    DatePipe,
    Badge,
    Icon,
    PricePipe,
  ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardPage {
  protected readonly adminStore = inject(AdminStore);

  protected readonly maxSalesCount = computed(() => {
    const data = this.adminStore.salesChartData();
    return Math.max(...data.map((d) => d.salesCount), 1);
  });

  protected readonly maxCustomerCount = computed(() => {
    const data = this.adminStore.customerGrowthData();
    return Math.max(...data.map((d) => d.newCustomers + d.returningCustomers), 1);
  });

  protected setTimeRange(range: TimeRange): void {
    this.adminStore.setTimeRange(range);
  }

  protected getOrderStatusVariant(status: string): BadgeVariant {
    switch (status) {
      case 'delivered':
        return 'success';
      case 'processing':
        return 'brand';
      case 'shipped':
        return 'neutral';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'danger';
      default:
        return 'neutral';
    }
  }
}
