import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import type { IconName } from './icon-name';

/**
 * Decorative inline SVG icon.
 *
 * Always renders `aria-hidden="true"`: an icon never carries the accessible name
 * of the control it sits in. Callers must supply visible or visually hidden text
 * alongside it, which is why this component takes no label input.
 */
@Component({
  selector: 'app-icon',
  templateUrl: './icon.html',
  styleUrl: './icon.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Icon {
  readonly name = input.required<IconName>();

  /** Rendered size in pixels. Defaults to the inline text size. */
  readonly size = input(20);
}
