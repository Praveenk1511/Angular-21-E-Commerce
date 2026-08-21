import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PlaceholderPage } from '@shared/components/placeholder-page/placeholder-page';

/** Route placeholder for inventory administration. Replaced by the admin phase. */
@Component({
  selector: 'app-admin-inventory',
  imports: [PlaceholderPage],
  template: `
    <app-placeholder-page
      heading="Inventory"
      description="Stock levels and adjustments will appear here."
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminInventory {}
