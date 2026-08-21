import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { APP_URLS } from '@core/config/route-paths';
import { Button } from '@shared/components/button/button';

@Component({
  selector: 'app-hero',
  imports: [RouterLink, Button],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hero {
  protected readonly shopUrl = APP_URLS.products;
}
