import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { PlaceholderPage } from '@shared/components/placeholder-page/placeholder-page';

/** Route placeholder for a category listing. Replaced by the product catalog phase. */
@Component({
  selector: 'app-category-products',
  imports: [PlaceholderPage],
  template: `
    <app-placeholder-page
      heading="Category"
      [description]="'Products in the ' + slug() + ' category will appear here.'"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryProducts {
  /** Bound from the `:slug` route parameter by `withComponentInputBinding()`. */
  readonly slug = input.required<string>();
}
