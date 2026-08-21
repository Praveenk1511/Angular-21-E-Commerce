import { ChangeDetectionStrategy, Component, computed, forwardRef, input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { uniqueId } from '@core/utils/unique-id';
import { Icon } from '@shared/components/icon/icon';
import { BaseControl } from '@shared/forms/base-control';

/**
 * Star rating, in two modes.
 *
 * Read-only (the default) is a display of an average, so it supports fractional
 * values and renders as static text plus stars. It is not focusable, because there is
 * nothing to operate — and the numeric value is exposed as real text so it does not
 * depend on counting filled shapes.
 *
 * Interactive mode is a single-choice control and is therefore built from native
 * radio inputs: whole values only, arrow-key cycling and one tab stop for the group,
 * all supplied by the platform. It implements `ControlValueAccessor`, so a review
 * form can bind it with `formControlName`.
 *
 * Note the shape of the read-only fill: one clipped overlay rather than per-star
 * fractions, which is what lets 3.6 render honestly instead of rounding.
 */
@Component({
  selector: 'app-rating',
  imports: [Icon],
  templateUrl: './rating.html',
  styleUrl: './rating.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => Rating), multi: true }],
})
export class Rating extends BaseControl<number> {
  readonly max = input(5);

  /** Display value for read-only mode. Ignored when interactive. */
  readonly rating = input(0);

  readonly readonly = input(true);

  /** Accessible name for the interactive group, or context for the read-only text. */
  readonly label = input('Rating');

  /** Show the numeric value beside the stars. */
  readonly showValue = input(false);

  protected readonly groupName = uniqueId('rating');

  protected readonly stars = computed(() =>
    Array.from({ length: Math.max(1, this.max()) }, (_, index) => index + 1),
  );

  protected readonly isDisabled = computed(() => this.disabledByForm());

  /** Read-only display value, clamped into range. */
  protected readonly displayValue = computed(() =>
    Math.min(Math.max(this.rating(), 0), this.max()),
  );

  /** Width of the filled overlay, as a percentage of the whole row. */
  protected readonly fillPercent = computed(
    () => (this.displayValue() / Math.max(1, this.max())) * 100,
  );

  /** Rounded to one decimal so "3.6 out of 5" reads cleanly. */
  protected readonly spokenValue = computed(
    () => `${Math.round(this.displayValue() * 10) / 10} out of ${this.max()}`,
  );

  protected readonly selected = computed(() => this.value() ?? 0);

  protected optionId(star: number): string {
    return `${this.groupName}-${star}`;
  }

  protected starLabel(star: number): string {
    return star === 1 ? '1 star' : `${star} stars`;
  }

  protected onSelect(star: number): void {
    this.commit(star);
  }
}
