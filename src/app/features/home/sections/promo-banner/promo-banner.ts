import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { APP_URLS } from '@core/config/route-paths';
import { Button } from '@shared/components/button/button';

@Component({
  selector: 'app-promo-banner',
  imports: [RouterLink, Button],
  templateUrl: './promo-banner.html',
  styleUrl: './promo-banner.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromoBanner {
  protected readonly shopUrl = APP_URLS.products;
}
