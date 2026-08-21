import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PlaceholderPage } from '@shared/components/placeholder-page/placeholder-page';

/** Route placeholder for order administration. Replaced by the admin phase. */
@Component({
  selector: 'app-admin-orders',
  imports: [PlaceholderPage],
  template: `
    <app-placeholder-page heading="Orders" description="Order fulfilment tools will appear here." />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOrders {}
