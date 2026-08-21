import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { uniqueId } from '@core/utils/unique-id';
import { Icon } from '@shared/components/icon/icon';

/**
 * Storefront search field.
 *
 * The markup is the real, final semantic structure — a labelled search landmark
 * with a submit control — but the controls stay disabled until the search feature
 * is built. Rendering an enabled box that silently does nothing would be a worse
 * lie to users and to assistive technology than an honestly unavailable one.
 *
 * The owning phase flips `enabled` to `true` and binds the query; no markup or
 * styling needs to change.
 */
@Component({
  selector: 'app-site-search',
  imports: [Icon],
  templateUrl: './site-search.html',
  styleUrl: './site-search.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteSearch {
  /** Whether the field accepts input. Disabled placeholder until search ships. */
  readonly enabled = input(false);

  /** Accessible label, also used as the visible placeholder. */
  readonly label = input('Search products');

  protected readonly inputId = uniqueId('site-search-input');
  protected readonly hintId = uniqueId('site-search-hint');

  /**
   * Stops the browser performing a native GET submission and reloading the app.
   * Query handling itself belongs to the search phase.
   */
  protected onSubmit(event: Event): void {
    event.preventDefault();
  }
}
