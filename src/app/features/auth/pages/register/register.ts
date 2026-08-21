import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PlaceholderPage } from '@shared/components/placeholder-page/placeholder-page';

/** Route placeholder for account creation. Replaced by the authentication phase. */
@Component({
  selector: 'app-register',
  imports: [PlaceholderPage],
  template: `
    <app-placeholder-page
      heading="Create account"
      description="The registration form will appear here."
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Register {}
