import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PlaceholderPage } from '@shared/components/placeholder-page/placeholder-page';

/** Route placeholder for reporting. Replaced by the admin phase. */
@Component({
  selector: 'app-admin-reports',
  imports: [PlaceholderPage],
  template: `
    <app-placeholder-page
      heading="Reports"
      description="Sales and inventory reports will appear here."
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminReports {}
