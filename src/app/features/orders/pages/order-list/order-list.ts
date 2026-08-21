import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PlaceholderPage } from '@shared/components/placeholder-page/placeholder-page';

/** Route placeholder for order history. Replaced by the orders phase. */
@Component({
  selector: 'app-order-list',
  imports: [PlaceholderPage],
  template: `
    <app-placeholder-page
      heading="Your orders"
      description="Past orders and their status will appear here."
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderList {}
