import { UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { APP_URLS } from '@core/config/route-paths';
import { Badge } from '@shared/components/badge/badge';
import { Button } from '@shared/components/button/button';
import { Icon } from '@shared/components/icon/icon';
import { PageContainer } from '@shared/components/page-container/page-container';
import { AuthStore } from '@state/auth.store';

/**
 * 403 Forbidden Access Denied Page (/unauthorized).
 *
 * Rendered when a signed-in user lacks the required role/permissions for a protected route.
 */
@Component({
  selector: 'app-unauthorized',
  imports: [
    UpperCasePipe,
    RouterLink,
    PageContainer,
    Button,
    Badge,
    Icon,
  ],
  templateUrl: './unauthorized.html',
  styleUrl: './unauthorized.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnauthorizedPage {
  protected readonly auth = inject(AuthStore);
  protected readonly homeUrl = APP_URLS.home;
  protected readonly loginUrl = APP_URLS.auth.login;

  protected logout(): void {
    this.auth.logout();
  }
}
