import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type BadgeVariant = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeSize = 'sm' | 'md';

/**
 * Compact status label.
 *
 * The variant only changes colour, so the projected text must always carry the
 * meaning — "Shipped", not a bare green dot. Colour cannot be the sole channel of
 * information (WCAG 1.4.1), and this component intentionally offers no way to render
 * an empty coloured badge.
 */
@Component({
  selector: 'app-badge',
  template: '<ng-content />',
  styleUrl: './badge.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses()',
  },
})
export class Badge {
  readonly variant = input<BadgeVariant>('neutral');
  readonly size = input<BadgeSize>('md');

  protected readonly hostClasses = computed(
    () => `badge badge--${this.variant()} badge--${this.size()}`,
  );
}
