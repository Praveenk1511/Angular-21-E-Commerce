import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
} from '@angular/core';

import { Spinner } from '@shared/components/spinner/spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Button styling and behaviour, applied to a native element.
 *
 * Deliberately an attribute selector rather than `<app-button>`. Wrapping a real
 * `<button>` inside a custom element means re-plumbing `type`, `disabled`, form
 * submission and focus through an extra layer, and it puts a non-semantic node
 * between the label and the control. Here the host *is* the native element, so all
 * of that keeps working for free and `<a appButton>` gets the same look without
 * pretending a link is a button.
 *
 * The loading state keeps the label in the DOM — swapping it for a spinner would
 * strip the accessible name mid-interaction — and marks the host `aria-busy`.
 */
@Component({
  selector: 'button[appButton], a[appButton]',
  imports: [Spinner],
  template: `
    @if (loading()) {
      <app-spinner class="button__spinner" [size]="16" [label]="loadingLabel()" />
    }
    <ng-content />
  `,
  styleUrl: './button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'button',
    '[class]': 'hostClasses()',
    '[attr.disabled]': 'nativeDisabled()',
    '[attr.aria-disabled]': 'ariaDisabled()',
    '[attr.aria-busy]': 'loading() ? "true" : null',
    '[attr.tabindex]': 'linkTabIndex()',
  },
})
export class Button {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly disabled = input(false);
  readonly loading = input(false);
  readonly fullWidth = input(false);

  /** Announced by the spinner's live region while `loading` is true. */
  readonly loadingLabel = input('Working');

  private readonly isNativeButton =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.tagName === 'BUTTON';

  protected readonly hostClasses = computed(() => {
    const classes = ['button', `button--${this.variant()}`, `button--${this.size()}`];

    if (this.fullWidth()) {
      classes.push('button--full');
    }

    if (this.isInert()) {
      classes.push('button--inert');
    }

    return classes.join(' ');
  });

  private readonly isInert = computed(() => this.disabled() || this.loading());

  /** Only a real button can carry the `disabled` attribute. */
  protected readonly nativeDisabled = computed(() =>
    this.isNativeButton && this.isInert() ? '' : null,
  );

  /**
   * An anchor cannot be natively disabled, so it advertises the state to assistive
   * technology instead and drops out of the tab order.
   */
  protected readonly ariaDisabled = computed(() =>
    !this.isNativeButton && this.isInert() ? 'true' : null,
  );

  protected readonly linkTabIndex = computed(() =>
    !this.isNativeButton && this.isInert() ? '-1' : null,
  );
}
