import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { PlaceholderPage } from '@shared/components/placeholder-page/placeholder-page';

/** Route placeholder for a single order. Replaced by the orders phase. */
@Component({
  selector: 'app-order-detail',
  imports: [PlaceholderPage],
  template: `
    <app-placeholder-page
      heading="Order details"
      [description]="'Details for order ' + id() + ' will appear here.'"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetail {
  /** Bound from the `:id` route parameter by `withComponentInputBinding()`. */
  readonly id = input.required<string>();
}
