import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Icon } from '@shared/components/icon/icon';
import type { IconName } from '@shared/components/icon/icon-name';

/**
 * "Nothing here" state for an empty collection.
 *
 * Distinct from {@link ErrorState}: an empty result is a normal outcome, not a
 * failure, so it is not announced as an alert and it offers a way forward rather
 * than a retry. The action slot is projected so callers supply their own buttons or
 * links without this component knowing any destinations.
 */
@Component({
  selector: 'app-empty-state',
  imports: [Icon],
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyState {
  readonly heading = input.required<string>();
  readonly description = input<string | null>(null);
  readonly icon = input<IconName>('inbox');
}
