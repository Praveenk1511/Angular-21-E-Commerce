import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { APP_CONFIG } from '@core/config/app-config';
import { PageContainer } from '@shared/components/page-container/page-container';

/**
 * Landing route placeholder.
 *
 * Deliberately free of storefront content: the catalog, promotions and any other
 * merchandising belong to later phases and will arrive through a store, never as
 * markup hard-coded here.
 */
@Component({
  selector: 'app-home',
  imports: [PageContainer],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  protected readonly appName = inject(APP_CONFIG).appName;
}
