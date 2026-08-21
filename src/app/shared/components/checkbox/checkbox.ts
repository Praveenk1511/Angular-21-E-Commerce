import { ChangeDetectionStrategy, Component, computed, forwardRef, input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { uniqueId } from '@core/utils/unique-id';
import { Icon } from '@shared/components/icon/icon';
import { BaseControl } from '@shared/forms/base-control';

/**
 * Boolean checkbox, usable with Reactive Forms.
 *
 * The real `<input type="checkbox">` stays in the DOM and remains the focusable,
 * clickable control; the styled box is a decorative sibling driven by `:checked` and
 * `:focus-visible`. Hiding a native input behind `opacity: 0` rather than
 * `display: none` is what keeps keyboard activation, form submission and screen
 * reader semantics intact.
 *
 * `indeterminate` is a visual and ARIA state only — it is never a value. A tri-state
 * checkbox still commits `true` or `false`, which is what "select all" headers need.
 */
@Component({
  selector: 'app-checkbox',
  imports: [Icon],
  templateUrl: './checkbox.html',
  styleUrl: './checkbox.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => Checkbox), multi: true }],
})
export class Checkbox extends BaseControl<boolean> {
  readonly label = input.required<string>();
  readonly hint = input<string | null>(null);
  readonly error = input<string | null>(null);
  readonly disabled = input(false);
  readonly required = input(false);

  /** Neither checked nor unchecked, for a partially selected group. */
  readonly indeterminate = input(false);

  protected readonly controlId = uniqueId('checkbox');
  protected readonly hintId = uniqueId('checkbox-hint');
  protected readonly errorId = uniqueId('checkbox-error');

  protected readonly isDisabled = computed(() => this.disabled() || this.disabledByForm());
  protected readonly isChecked = computed(() => this.value() === true);

  protected readonly describedBy = computed(() => {
    if (this.error()) {
      return this.errorId;
    }

    return this.hint() ? this.hintId : null;
  });

  protected onChange(event: Event): void {
    this.commit((event.target as HTMLInputElement).checked);
  }
}
