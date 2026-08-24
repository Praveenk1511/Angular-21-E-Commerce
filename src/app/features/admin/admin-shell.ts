import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { APP_URLS } from '@core/config/route-paths';
import { Icon } from '@shared/components/icon/icon';
import { AdminStore } from '@state/admin.store';
import { AuthStore } from '@state/auth.store';

import type { IconName } from '@shared/components/icon/icon-name';

export interface AdminNavItem {
  readonly id: string;
  readonly label: string;
  readonly url: string;
  readonly icon: IconName;
  readonly badge?: string;
}

/**
 * Admin Application Shell layout component.
 */
@Component({
  selector: 'app-admin-shell',
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    Icon,
  ],
  templateUrl: './admin-shell.html',
  styleUrl: './admin-shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminShell {
  protected readonly adminStore = inject(AdminStore);
  protected readonly authStore = inject(AuthStore);

  protected readonly storefrontUrl = APP_URLS.home;

  protected readonly navItems: readonly AdminNavItem[] = [
    { id: 'dashboard', label: 'Dashboard', url: '/admin/dashboard', icon: 'star' },
    { id: 'products', label: 'Products Catalog', url: '/admin/products', icon: 'cart', badge: '48' },
    { id: 'categories', label: 'Categories', url: '/admin/categories', icon: 'menu' },
    { id: 'orders', label: 'Orders Management', url: '/admin/orders', icon: 'check-circle', badge: '12' },
    { id: 'users', label: 'Customers', url: '/admin/users', icon: 'user' },
    { id: 'coupons', label: 'Coupons & Promos', url: '/admin/coupons', icon: 'star' },
    { id: 'reports', label: 'Sales Reports', url: '/admin/reports', icon: 'info' },
  ];
}
