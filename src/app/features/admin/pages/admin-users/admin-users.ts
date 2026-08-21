import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PlaceholderPage } from '@shared/components/placeholder-page/placeholder-page';

/** Route placeholder for user administration. Replaced by the admin phase. */
@Component({
  selector: 'app-admin-users',
  imports: [PlaceholderPage],
  template: `
    <app-placeholder-page heading="Users" description="Customer accounts will appear here." />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUsers {}
