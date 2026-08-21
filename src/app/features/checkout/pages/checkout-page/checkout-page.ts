import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PlaceholderPage } from '@shared/components/placeholder-page/placeholder-page';

/** Route placeholder for checkout. Replaced by the checkout phase. */
@Component({
  selector: 'app-checkout-page',
  imports: [PlaceholderPage],
  template: `
    <app-placeholder-page
      heading="Checkout"
      description="The delivery, payment and review steps will appear here."
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutPage {}
