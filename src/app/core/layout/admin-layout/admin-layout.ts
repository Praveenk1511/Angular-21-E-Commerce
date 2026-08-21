import { ChangeDetectionStrategy, Component, ElementRef, viewChild } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

import { ADMIN_NAVIGATION } from '@core/config/navigation.config';
import { createDisclosure } from '@core/layout/disclosure';
import { MainNavigation } from '@core/layout/main-navigation/main-navigation';
import { APP_URLS } from '@core/config/route-paths';
import { Icon } from '@shared/components/icon/icon';

/**
 * Shell for the administration area.
 *
 * Separate from the storefront shell because the two have different navigation and
 * different chrome. The sidebar reuses `MainNavigation` in its `stacked`
 * orientation rather than duplicating a link list, and the mobile disclosure reuses
 * `createDisclosure` so its behaviour matches the storefront menu exactly.
 *
 * This is layout only. Nothing here reads admin data or checks permissions —
 * access control arrives with the auth phase via guards on the admin routes, which
 * already declare `requiresAdmin` in their metadata.
 */
@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, MainNavigation, Icon],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(keydown.escape)': 'closeSidebar()',
  },
})
export class AdminLayout {
  protected readonly navigationItems = ADMIN_NAVIGATION;
  protected readonly storefrontUrl = APP_URLS.home;

  private readonly sidebar = createDisclosure('admin-sidebar');
  protected readonly sidebarId = this.sidebar.panelId;
  protected readonly sidebarOpen = this.sidebar.isOpen.asReadonly();

  private readonly sidebarToggle = viewChild<ElementRef<HTMLButtonElement>>('sidebarToggle');

  protected toggleSidebar(): void {
    this.sidebar.isOpen.update((open) => !open);
  }

  protected closeSidebar(): void {
    if (!this.sidebarOpen()) {
      return;
    }

    this.sidebar.isOpen.set(false);
    this.sidebarToggle()?.nativeElement.focus();
  }
}
