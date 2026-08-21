import { ChangeDetectionStrategy, Component, computed, forwardRef, input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { uniqueId } from '@core/utils/unique-id';
import { FormField } from '@shared/components/form-field/form-field';
import { Icon } from '@shared/components/icon/icon';
import { BaseControl } from '@shared/forms/base-control';
import type { ChoiceOption } from '@shared/models/option.model';

/**
 * Dropdown built on a native `<select>`, usable with Reactive Forms.
 *
 * Native on purpose. A custom listbox would need roving `tabindex`, type-ahead,
 * `aria-activedescendant` and its own popup positioning, and would still lose the
 * platform picker that mobile and screen-reader users expect. The only thing styled
 * here is the box and the chevron; the option list stays the browser's.
 */
@Component({
  selector: 'app-select',
  imports: [FormField, Icon],
  templateUrl: './select.html',
  styleUrl: './select.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => Select), multi: true }],
})
export class Select extends BaseControl<string> {
  readonly label = input.required<string>();
  readonly options = input.required<readonly ChoiceOption[]>();

  /** Rendered as a disabled first option representing "nothing chosen". */
  readonly placeholder = input<string | null>(null);

  readonly hint = input<string | null>(null);
  readonly error = input<string | null>(null);
  readonly required = input(false);
  readonly disabled = input(false);
  readonly labelHidden = input(false);

  protected readonly controlId = uniqueId('select');
  protected readonly hintId = uniqueId('select-hint');
  protected readonly errorId = uniqueId('select-error');

  protected readonly isDisabled = computed(() => this.disabled() || this.disabledByForm());

  protected readonly describedBy = computed(() => {
    if (this.error()) {
      return this.errorId;
    }

    return this.hint() ? this.hintId : null;
  });

  protected onChange(event: Event): void {
    this.commit((event.target as HTMLSelectElement).value);
  }
}
