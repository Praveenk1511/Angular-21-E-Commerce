import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { APP_CONFIG } from '@core/config/app-config';

/**
 * Brand lockup: mark plus wordmark, linked to the storefront home.
 *
 * A placeholder identity built from design tokens rather than an image asset, so
 * swapping in real artwork later touches this component only. The wordmark reads
 * from app configuration instead of hard-coding the store name.
 */
@Component({
  selector: 'app-site-logo',
  imports: [RouterLink],
  templateUrl: './site-logo.html',
  styleUrl: './site-logo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteLogo {
  protected readonly appName = inject(APP_CONFIG).appName;
}
