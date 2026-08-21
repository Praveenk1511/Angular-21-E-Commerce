import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PlaceholderPage } from '@shared/components/placeholder-page/placeholder-page';

/** Route placeholder for the shopping cart. Replaced by the cart phase. */
@Component({
  selector: 'app-cart-page',
  imports: [PlaceholderPage],
  template: `
    <app-placeholder-page
      heading="Your cart"
      description="Cart line items, quantities and totals will appear here."
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartPage {}
