import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { APP_CONFIG } from '@core/config/app-config';
import { AUTH_NAVIGATION } from '@core/config/navigation.config';
import { SiteLogo } from '@core/layout/site-logo/site-logo';

/**
 * Shell for the authentication area.
 *
 * Deliberately not the storefront shell: sign-in pages drop the catalog chrome so
 * there is nothing competing with the form. The logo stays as the route back to
 * the store, and the area's own cross-links sit beneath the card.
 */
@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, SiteLogo],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthLayout {
  protected readonly appName = inject(APP_CONFIG).appName;
  protected readonly currentYear = new Date().getFullYear();
  protected readonly authLinks = AUTH_NAVIGATION;
}
