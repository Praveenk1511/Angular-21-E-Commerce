import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { APP_URLS } from '@core/config/route-paths';
import { Badge } from '@shared/components/badge/badge';
import { Icon } from '@shared/components/icon/icon';
import { PageContainer } from '@shared/components/page-container/page-container';
import { AddressStore } from '@state/address.store';
import { AuthStore } from '@state/auth.store';
import { OrdersStore } from '@state/orders.store';

/**
 * Main Layout Shell for the Profile area (/profile/*).
 *
 * Renders user avatar header banner, member status badges, statistics summary chips,
 * profile navigation tab bar, and router outlet for child pages.
 */
@Component({
  selector: 'app-profile-shell',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    DatePipe,
    PageContainer,
    Badge,
    Icon,
  ],
  templateUrl: './profile-shell.html',
  styleUrl: './profile-shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileShell {
  protected readonly authStore = inject(AuthStore);
  protected readonly ordersStore = inject(OrdersStore);
  protected readonly addressStore = inject(AddressStore);

  protected readonly overviewUrl = '/profile/overview';
  protected readonly addressesUrl = '/profile/addresses';
  protected readonly securityUrl = '/profile/security';
  protected readonly ordersUrl = APP_URLS.orders;

  protected get userInitials(): string {
    const u = this.authStore.currentUser();
    if (!u) return 'U';
    return `${u.firstName[0] ?? ''}${u.lastName[0] ?? ''}`.toUpperCase();
  }
}
