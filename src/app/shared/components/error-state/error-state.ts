import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { Button } from '@shared/components/button/button';
import { Icon } from '@shared/components/icon/icon';

/**
 * Failure state for content that could not load.
 *
 * The container is a polite live region, so an error appearing after an
 * already-rendered page (a failed refresh, say) is announced rather than silently
 * replacing content. Polite rather than assertive: it should not interrupt whatever
 * the user is currently hearing.
 *
 * Emits `retry` instead of performing one — retrying is the caller's concern, and
 * this component holds no knowledge of what failed.
 */
@Component({
  selector: 'app-error-state',
  imports: [Icon, Button],
  templateUrl: './error-state.html',
  styleUrl: './error-state.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorState {
  readonly heading = input('Something went wrong');
  readonly message = input<string | null>('The information could not be loaded.');
  readonly retryLabel = input('Try again');
  readonly showRetry = input(true);

  readonly retry = output<void>();
}
