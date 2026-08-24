import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, inject, viewChild } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { HEADER_ACTIONS, PRIMARY_NAVIGATION } from '@core/config/navigation.config';
import { APP_URLS } from '@core/config/route-paths';
import { createDisclosure } from '@core/layout/disclosure';
import { MainNavigation } from '@core/layout/main-navigation/main-navigation';
import { SiteLogo } from '@core/layout/site-logo/site-logo';
import { SiteSearch } from '@core/layout/site-search/site-search';
import type { NotificationKind } from '@core/models';
import { Icon } from '@shared/components/icon/icon';
import type { IconName } from '@shared/components/icon/icon-name';
import { AuthStore } from '@state/auth.store';
import { CartStore } from '@state/cart.store';
import { NotificationStore } from '@state/notification.store';
import { WishlistStore } from '@state/wishlist.store';

/**
 * Storefront masthead.
 *
 * Composes logo, search, utility actions, notification bell, dropdown, and primary navigation.
 */
@Component({
  selector: 'app-site-header',
  imports: [
    RouterLink,
    RouterLinkActive,
    DatePipe,
    Icon,
    MainNavigation,
    SiteLogo,
    SiteSearch,
  ],
  templateUrl: './site-header.html',
  styleUrl: './site-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(keydown.escape)': 'closeAll()',
  },
})
export class SiteHeader {
  protected readonly auth = inject(AuthStore);
  protected readonly cart = inject(CartStore);
  protected readonly wishlist = inject(WishlistStore);
  protected readonly notifications = inject(NotificationStore);

  protected readonly navigationItems = PRIMARY_NAVIGATION;
  protected readonly profileUrl = APP_URLS.profile;
  protected readonly notificationsUrl = APP_URLS.notifications;

  /** Non-auth actions: wishlist and cart. The account action is handled separately. */
  protected readonly utilityActions = HEADER_ACTIONS.filter((action) => action.id !== 'login');

  /** Shown only when signed out. */
  protected readonly loginAction = HEADER_ACTIONS.find((action) => action.id === 'login');

  private readonly menu = createDisclosure('site-header-menu');
  protected readonly menuId = this.menu.panelId;
  protected readonly menuOpen = this.menu.isOpen.asReadonly();

  private readonly menuToggle = viewChild<ElementRef<HTMLButtonElement>>('menuToggle');

  protected toggleMenu(): void {
    this.menu.isOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    if (!this.menuOpen()) {
      return;
    }

    this.menu.isOpen.set(false);
    this.menuToggle()?.nativeElement.focus();
  }

  protected closeAll(): void {
    this.closeMenu();
    this.notifications.closeDropdown();
  }

  protected getKindIcon(kind: NotificationKind): IconName {
    switch (kind) {
      case 'order':
        return 'cart';
      case 'payment':
        return 'check-circle';
      case 'account':
        return 'user';
      case 'promotion':
        return 'star';
      case 'system':
      default:
        return 'info';
    }
  }

  protected logout(): void {
    this.auth.logout();
  }
}
