import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PlaceholderPage } from '@shared/components/placeholder-page/placeholder-page';

/** Route placeholder for sign-in. Replaced by the authentication phase. */
@Component({
  selector: 'app-login',
  imports: [PlaceholderPage],
  template: `
    <app-placeholder-page heading="Sign in" description="The sign-in form will appear here." />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {}
