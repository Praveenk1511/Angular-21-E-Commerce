import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Indeterminate loading indicator.
 *
 * Carries `role="status"` and a visually hidden label so the wait is announced
 * rather than merely drawn. Callers that already announce loading some other way
 * should pass `announce=false` to avoid a duplicate live region.
 */
@Component({
  selector: 'app-spinner',
  template: `
    <span class="spinner__track" aria-hidden="true"></span>
    @if (announce()) {
      <span class="visually-hidden" role="status">{{ label() }}</span>
    }
  `,
  styleUrl: './spinner.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'spinner',
    '[style.--spinner-size.px]': 'size()',
  },
})
export class Spinner {
  /** Diameter in pixels. */
  readonly size = input(24);

  readonly label = input('Loading');

  /** Whether to expose a live region announcing the label. */
  readonly announce = input(true);
}
