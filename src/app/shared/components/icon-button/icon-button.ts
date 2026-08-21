import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type IconButtonVariant = 'plain' | 'subtle' | 'danger';
export type IconButtonSize = 'sm' | 'md';

/**
 * Square, icon-only button.
 *
 * `label` is a required input rather than an optional convenience, because an
 * icon-only control with no accessible name is invisible to screen readers and to
 * voice control. Making it required means that mistake cannot compile.
 *
 * The icon itself is projected and stays `aria-hidden` (see {@link Icon}), so the
 * label is the single source of the control's name.
 */
@Component({
  selector: 'button[appIconButton]',
  template: '<ng-content />',
  styleUrl: './icon-button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses()',
    '[attr.aria-label]': 'label()',
    '[attr.disabled]': 'disabled() ? "" : null',
    type: 'button',
  },
})
export class IconButton {
  /** Accessible name for the control. */
  readonly label = input.required<string>();

  readonly variant = input<IconButtonVariant>('plain');
  readonly size = input<IconButtonSize>('md');
  readonly disabled = input(false);

  protected readonly hostClasses = computed(
    () => `icon-button icon-button--${this.variant()} icon-button--${this.size()}`,
  );
}
