import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Button } from '@shared/components/button/button';
import { TextInput } from '@shared/components/input/input';

/**
 * Email newsletter sign-up section.
 *
 * No backend integration — the form validates and shows a success message. Wiring to
 * a real email service belongs to a later phase. The form structure is realistic so it
 * can be connected without changes.
 */
@Component({
  selector: 'app-newsletter',
  imports: [ReactiveFormsModule, TextInput, Button],
  templateUrl: './newsletter.html',
  styleUrl: './newsletter.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Newsletter {
  protected readonly submitted = signal(false);

  protected readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      return;
    }

    // No real endpoint yet — just show confirmation.
    this.submitted.set(true);
  }

  protected emailError(): string | null {
    const control = this.form.controls.email;

    if (!control.touched || control.valid) {
      return null;
    }

    if (control.hasError('required')) {
      return 'Enter your email address.';
    }

    return 'Enter a valid email address.';
  }
}
