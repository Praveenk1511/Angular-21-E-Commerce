import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PlaceholderPage } from '@shared/components/placeholder-page/placeholder-page';

/** Route placeholder for the user profile. Replaced by the account phase. */
@Component({
  selector: 'app-profile-page',
  imports: [PlaceholderPage],
  template: `
    <app-placeholder-page
      heading="Your profile"
      description="Account details, addresses and preferences will appear here."
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePage {}
