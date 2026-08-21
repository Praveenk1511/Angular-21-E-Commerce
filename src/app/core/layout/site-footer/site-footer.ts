import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { APP_CONFIG } from '@core/config/app-config';
import { FOOTER_NAVIGATION } from '@core/config/navigation.config';
import { SiteLogo } from '@core/layout/site-logo/site-logo';

/**
 * Site footer: grouped secondary navigation plus the legal bottom bar.
 *
 * Link columns come from navigation configuration, so adding a destination is a
 * config change. Groups use headings rather than nested `region` landmarks, which
 * keeps a single `Footer` landmark instead of five competing ones.
 */
@Component({
  selector: 'app-site-footer',
  imports: [RouterLink, RouterLinkActive, SiteLogo],
  templateUrl: './site-footer.html',
  styleUrl: './site-footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteFooter {
  protected readonly appName = inject(APP_CONFIG).appName;
  protected readonly currentYear = new Date().getFullYear();
  protected readonly linkGroups = FOOTER_NAVIGATION;
}
