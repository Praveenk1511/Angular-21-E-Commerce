import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PlaceholderPage } from '@shared/components/placeholder-page/placeholder-page';

/** Route placeholder for the catalog listing. Replaced by the product catalog phase. */
@Component({
  selector: 'app-product-list',
  imports: [PlaceholderPage],
  template: `
    <app-placeholder-page
      heading="Shop"
      description="The product catalog, filters and sorting will appear here."
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductList {}
