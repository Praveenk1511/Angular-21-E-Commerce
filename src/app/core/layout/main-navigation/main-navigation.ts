import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import type { NavigationItem } from '@core/models';

/**
 * How the list arranges itself.
 *
 * - `responsive`: stacked on small screens, inline from `lg` up. The storefront
 *   header uses this so one instance serves both the mobile menu and the nav bar.
 * - `stacked`: always vertical, for sidebar navigation.
 */
export type NavigationOrientation = 'responsive' | 'stacked';

/**
 * Navigation list.
 *
 * Presentational and reusable: it renders whatever items it is given and holds no
 * knowledge of where they come from. A single instance serves both the desktop nav
 * bar and the mobile menu — CSS changes the orientation — which keeps exactly one
 * `nav` landmark in the accessibility tree instead of two competing duplicates.
 */
@Component({
  selector: 'app-main-navigation',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './main-navigation.html',
  styleUrl: './main-navigation.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.main-navigation--stacked]': "orientation() === 'stacked'",
  },
})
export class MainNavigation {
  readonly items = input.required<readonly NavigationItem[]>();

  /** Distinguishes this landmark from other `nav` elements on the page. */
  readonly label = input('Primary');

  readonly orientation = input<NavigationOrientation>('responsive');
}
