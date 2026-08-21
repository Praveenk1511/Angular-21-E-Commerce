import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Label, hint and error chrome around a form control.
 *
 * Internal to the design system: application code uses {@link Input},
 * {@link Select} and friends, which compose this. It exists so those three do not
 * each carry their own copy of the same markup and spacing.
 *
 * It takes ids rather than generating them. The control owns its `id`, `hintId` and
 * `errorId` because the control is what must point `aria-describedby` at them —
 * having the wrapper mint ids would mean passing them back up, and a wrapper that
 * silently owns half of an aria relationship is how those relationships get broken.
 */
@Component({
  selector: 'app-form-field',
  templateUrl: './form-field.html',
  styleUrl: './form-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormField {
  readonly label = input.required<string>();

  /** Id of the control this label is `for`. */
  readonly controlId = input.required<string>();

  readonly hint = input<string | null>(null);
  readonly hintId = input.required<string>();

  /** When set, replaces the hint and is announced as the control's description. */
  readonly error = input<string | null>(null);
  readonly errorId = input.required<string>();

  readonly required = input(false);

  /** Hide the label visually while keeping it available to assistive technology. */
  readonly labelHidden = input(false);
}
