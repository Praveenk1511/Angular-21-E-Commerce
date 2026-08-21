import { signal } from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';

/**
 * Shared `ControlValueAccessor` plumbing for design-system form controls.
 *
 * Every control in this library is usable with Reactive Forms — `formControlName`,
 * validators, `setDisabledState` and touched tracking all work — without each
 * component re-implementing the same six methods.
 *
 * Subclasses read {@link value} and {@link disabledByForm} as signals in their
 * templates, and call {@link commit} / {@link markTouched} from event handlers.
 *
 * Note the deliberate split between `disabledByForm` (set by
 * `formControl.disable()`) and a component's own `disabled` input: a control can be
 * disabled by either, and conflating them makes the form the loser.
 */
export abstract class BaseControl<T> implements ControlValueAccessor {
  /** Current value as written by the form, or by the user through {@link commit}. */
  protected readonly value = signal<T | null>(null);

  /** True when the bound form control itself has been disabled. */
  protected readonly disabledByForm = signal(false);

  private notifyChange: (value: T | null) => void = () => undefined;
  private notifyTouched: () => void = () => undefined;

  writeValue(value: T | null): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: T | null) => void): void {
    this.notifyChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.notifyTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledByForm.set(isDisabled);
  }

  /** Record a user-driven value change and propagate it to the form. */
  protected commit(value: T | null): void {
    this.value.set(value);
    this.notifyChange(value);
  }

  /** Mark the control touched, normally on blur, so validation may display. */
  protected markTouched(): void {
    this.notifyTouched();
  }
}
