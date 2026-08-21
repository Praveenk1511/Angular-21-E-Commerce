import { ChangeDetectionStrategy, Component, computed, forwardRef, input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { uniqueId } from '@core/utils/unique-id';
import { FormField } from '@shared/components/form-field/form-field';
import { BaseControl } from '@shared/forms/base-control';

export type TextInputType = 'text' | 'email' | 'password' | 'search' | 'tel' | 'url';

/**
 * Single-line text field, usable with Reactive Forms.
 *
 * Owns the ids that wire label, hint and error together, and points
 * `aria-describedby` at whichever of hint or error is currently rendered. When
 * `error` is set the field also reports `aria-invalid`, so the failure is exposed
 * to assistive technology and not only drawn in red.
 */
@Component({
  selector: 'app-input',
  imports: [FormField],
  templateUrl: './input.html',
  styleUrl: './input.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TextInput), multi: true },
  ],
})
export class TextInput extends BaseControl<string> {
  readonly label = input.required<string>();
  readonly type = input<TextInputType>('text');
  readonly placeholder = input('');
  readonly hint = input<string | null>(null);
  readonly error = input<string | null>(null);
  readonly required = input(false);
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly autocomplete = input<string | null>(null);
  readonly labelHidden = input(false);

  protected readonly controlId = uniqueId('input');
  protected readonly hintId = uniqueId('input-hint');
  protected readonly errorId = uniqueId('input-error');

  protected readonly isDisabled = computed(() => this.disabled() || this.disabledByForm());

  /** Points only at the message actually in the DOM, never at an absent element. */
  protected readonly describedBy = computed(() => {
    if (this.error()) {
      return this.errorId;
    }

    return this.hint() ? this.hintId : null;
  });

  protected onInput(event: Event): void {
    this.commit((event.target as HTMLInputElement).value);
  }
}
