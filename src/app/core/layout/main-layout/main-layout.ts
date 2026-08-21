import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SiteFooter } from '@core/layout/site-footer/site-footer';
import { SiteHeader } from '@core/layout/site-header/site-header';

/**
 * Storefront shell: header, routed content region, footer.
 *
 * Used as a parent route component so every child view inherits the chrome
 * without re-declaring it, and so alternative shells (checkout, admin) can be
 * introduced later as sibling layouts.
 */
@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, SiteHeader, SiteFooter],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayout {}
