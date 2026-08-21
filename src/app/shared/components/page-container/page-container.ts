import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Width presets available to a page's content column. */
export type PageContainerSize = 'narrow' | 'default' | 'wide';

/**
 * Main content container.
 *
 * Owns the page gutter, max width and vertical rhythm so routed views never
 * re-implement layout math. Purely presentational: content is projected, and the
 * only input is the width preset.
 */
@Component({
  selector: 'app-page-container',
  template: '<ng-content />',
  styleUrl: './page-container.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'page-container',
    '[class.page-container--narrow]': "size() === 'narrow'",
    '[class.page-container--wide]': "size() === 'wide'",
  },
})
export class PageContainer {
  readonly size = input<PageContainerSize>('default');
}
