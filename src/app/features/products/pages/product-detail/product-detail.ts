import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { PlaceholderPage } from '@shared/components/placeholder-page/placeholder-page';

/** Route placeholder for a single product. Replaced by the product catalog phase. */
@Component({
  selector: 'app-product-detail',
  imports: [PlaceholderPage],
  template: `
    <app-placeholder-page
      heading="Product details"
      [description]="'Details for product ' + id() + ' will appear here.'"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetail {
  /**
   * Bound from the `:id` route parameter by `withComponentInputBinding()`.
   * Kept as a string because that is what a URL segment is; parsing belongs to the
   * phase that resolves a real product.
   */
  readonly id = input.required<string>();
}
