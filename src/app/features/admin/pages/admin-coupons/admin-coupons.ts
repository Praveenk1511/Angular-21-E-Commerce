import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PlaceholderPage } from '@shared/components/placeholder-page/placeholder-page';

/** Route placeholder for coupon administration. Replaced by the admin phase. */
@Component({
  selector: 'app-admin-coupons',
  imports: [PlaceholderPage],
  template: `
    <app-placeholder-page
      heading="Coupons"
      description="Discount codes and promotions will appear here."
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCoupons {}
