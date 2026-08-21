import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PlaceholderPage } from '@shared/components/placeholder-page/placeholder-page';

/** Route placeholder for product administration. Replaced by the admin phase. */
@Component({
  selector: 'app-admin-products',
  imports: [PlaceholderPage],
  template: `
    <app-placeholder-page
      heading="Products"
      description="Product management tools will appear here."
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProducts {}
