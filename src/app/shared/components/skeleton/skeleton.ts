import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type SkeletonVariant = 'text' | 'rect' | 'circle';

/**
 * Loading placeholder.
 *
 * Purely decorative and therefore `aria-hidden`: a screen reader gains nothing from
 * hearing about grey boxes. The surrounding region is responsible for announcing the
 * wait — mark it `aria-busy="true"` or pair it with a {@link Spinner} whose live
 * region does the talking.
 *
 * The shimmer is non-essential motion, so it is allowed to stop entirely under
 * `prefers-reduced-motion` (unlike the spinner, which must keep moving).
 */
@Component({
  selector: 'app-skeleton',
  template: `
    @for (line of lineIndexes(); track line) {
      <span class="skeleton__bar"></span>
    }
  `,
  styleUrl: './skeleton.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses()',
    'aria-hidden': 'true',
    '[style.--skeleton-width]': 'width()',
    '[style.--skeleton-height]': 'height()',
  },
})
export class Skeleton {
  readonly variant = input<SkeletonVariant>('text');

  /** Any CSS length. Defaults to filling the available inline space. */
  readonly width = input('100%');

  /** Any CSS length. Defaults to a value suited to the variant. */
  readonly height = input<string | null>(null);

  /** Number of stacked bars, for multi-line text placeholders. */
  readonly lines = input(1);

  protected readonly lineIndexes = computed(() =>
    Array.from({ length: Math.max(1, this.lines()) }, (_, index) => index),
  );

  protected readonly hostClasses = computed(() => `skeleton skeleton--${this.variant()}`);
}
