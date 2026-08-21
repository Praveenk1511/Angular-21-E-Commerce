import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PlaceholderPage } from '@shared/components/placeholder-page/placeholder-page';

/** Route placeholder for the admin dashboard. Replaced by the admin phase. */
@Component({
  selector: 'app-admin-dashboard',
  imports: [PlaceholderPage],
  template: `
    <app-placeholder-page
      heading="Dashboard"
      description="Store performance summaries will appear here."
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboard {}
