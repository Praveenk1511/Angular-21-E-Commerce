import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PlaceholderPage } from '@shared/components/placeholder-page/placeholder-page';

/** Route placeholder for password recovery. Replaced by the authentication phase. */
@Component({
  selector: 'app-forgot-password',
  imports: [PlaceholderPage],
  template: `
    <app-placeholder-page
      heading="Forgot password"
      description="The password reset request form will appear here."
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPassword {}
