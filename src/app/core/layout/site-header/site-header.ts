import { ChangeDetectionStrategy, Component, ElementRef, viewChild } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { HEADER_ACTIONS, PRIMARY_NAVIGATION } from '@core/config/navigation.config';
import { createDisclosure } from '@core/layout/disclosure';
import { MainNavigation } from '@core/layout/main-navigation/main-navigation';
import { SiteLogo } from '@core/layout/site-logo/site-logo';
import { SiteSearch } from '@core/layout/site-search/site-search';
import { Icon } from '@shared/components/icon/icon';

/**
 * Storefront masthead.
 *
 * Composes the logo, search field, utility actions and primary navigation. Its
 * only behaviour is the mobile disclosure menu; everything else is composition,
 * and every label and destination comes from navigation configuration.
 *
 * The menu follows the ARIA disclosure pattern: a button owning `aria-expanded`
 * and `aria-controls`, a panel that is genuinely removed from the accessibility
 * tree with `display: none` when collapsed, Escape to dismiss, and focus returned
 * to the button afterwards.
 */
@Component({
  selector: 'app-site-header',
  imports: [RouterLink, RouterLinkActive, Icon, MainNavigation, SiteLogo, SiteSearch],
  templateUrl: './site-header.html',
  styleUrl: './site-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(keydown.escape)': 'closeMenu()',
  },
})
export class SiteHeader {
  protected readonly navigationItems = PRIMARY_NAVIGATION;
  protected readonly actions = HEADER_ACTIONS;

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
    // Escape must not strand focus inside a panel that no longer exists.
    this.menuToggle()?.nativeElement.focus();
  }
}
