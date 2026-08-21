import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PlaceholderPage } from '@shared/components/placeholder-page/placeholder-page';

/** Route placeholder for category administration. Replaced by the admin phase. */
@Component({
  selector: 'app-admin-categories',
  imports: [PlaceholderPage],
  template: `
    <app-placeholder-page
      heading="Categories"
      description="Category management tools will appear here."
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCategories {}
