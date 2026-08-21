import { ChangeDetectionStrategy, Component, computed, forwardRef, input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { uniqueId } from '@core/utils/unique-id';
import { BaseControl } from '@shared/forms/base-control';
import type { ChoiceOption } from '@shared/models/option.model';

export type RadioOrientation = 'vertical' | 'horizontal';

/**
 * Single-choice group, usable with Reactive Forms.
 *
 * A group rather than a lone `Radio` component, because a single radio button is not
 * a usable control: the roving tab stop, arrow-key cycling and "exactly one of these"
 * semantics only exist across a named set. Exposing one radio at a time would push
 * that coordination onto every caller.
 *
 * Native `<input type="radio">` elements sharing a name give all of that keyboard
 * behaviour for free, and `<fieldset>`/`<legend>` gives the group its accessible
 * name — which `aria-labelledby` on a div would only approximate.
 */
@Component({
  selector: 'app-radio-group',
  templateUrl: './radio-group.html',
  styleUrl: './radio-group.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RadioGroup), multi: true },
  ],
})
export class RadioGroup extends BaseControl<string> {
  readonly label = input.required<string>();
  readonly options = input.required<readonly ChoiceOption[]>();
  readonly hint = input<string | null>(null);
  readonly error = input<string | null>(null);
  readonly disabled = input(false);
  readonly required = input(false);
  readonly orientation = input<RadioOrientation>('vertical');

  /** Shared `name`, which is what makes the browser treat these as one group. */
  protected readonly groupName = uniqueId('radio-group');
  protected readonly hintId = uniqueId('radio-group-hint');
  protected readonly errorId = uniqueId('radio-group-error');

  protected readonly isDisabled = computed(() => this.disabled() || this.disabledByForm());

  protected readonly describedBy = computed(() => {
    if (this.error()) {
      return this.errorId;
    }

    return this.hint() ? this.hintId : null;
  });

  protected optionId(value: string): string {
    return `${this.groupName}-${value}`;
  }

  protected isSelected(value: string): boolean {
    return this.value() === value;
  }

  protected onSelect(value: string): void {
    this.commit(value);
  }
}
