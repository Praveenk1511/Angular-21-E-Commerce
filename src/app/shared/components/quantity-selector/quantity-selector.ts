import { ChangeDetectionStrategy, Component, computed, forwardRef, input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { uniqueId } from '@core/utils/unique-id';
import { Icon } from '@shared/components/icon/icon';
import { BaseControl } from '@shared/forms/base-control';

/**
 * Numeric stepper, usable with Reactive Forms.
 *
 * A real `<input type="number">` sits between the two buttons, so the value can be
 * typed, selected and pasted rather than only clicked up one at a time — a
 * button-only stepper is painful for anyone changing 1 to 20.
 *
 * Clamping is presentational, not commercial: `min`/`max` are whatever the caller
 * passes. Stock limits, order minimums and the like are decided elsewhere and handed
 * in; this component has no opinion about what the number counts.
 */
@Component({
  selector: 'app-quantity-selector',
  imports: [Icon],
  templateUrl: './quantity-selector.html',
  styleUrl: './quantity-selector.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => QuantitySelector), multi: true },
  ],
})
export class QuantitySelector extends BaseControl<number> {
  readonly label = input('Quantity');
  readonly min = input(1);
  readonly max = input(99);
  readonly step = input(1);
  readonly disabled = input(false);

  /** Hide the visible label, for use in dense rows that label the column instead. */
  readonly labelHidden = input(true);

  protected readonly controlId = uniqueId('quantity');

  protected readonly isDisabled = computed(() => this.disabled() || this.disabledByForm());

  protected readonly current = computed(() => this.value() ?? this.min());

  protected readonly canDecrease = computed(
    () => !this.isDisabled() && this.current() > this.min(),
  );

  protected readonly canIncrease = computed(
    () => !this.isDisabled() && this.current() < this.max(),
  );

  protected decrease(): void {
    this.commit(this.clamp(this.current() - this.step()));
  }

  protected increase(): void {
    this.commit(this.clamp(this.current() + this.step()));
  }

  protected onInput(event: Event): void {
    const raw = Number.parseInt((event.target as HTMLInputElement).value, 10);

    // An empty or non-numeric field falls back to the minimum rather than NaN.
    this.commit(Number.isNaN(raw) ? this.min() : this.clamp(raw));
  }

  private clamp(value: number): number {
    return Math.min(Math.max(value, this.min()), this.max());
  }
}
