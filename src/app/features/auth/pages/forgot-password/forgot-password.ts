import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { tap } from 'rxjs';

import { APP_URLS } from '@core/config/route-paths';
import { AuthService } from '@core/services/auth.service';
import { Button } from '@shared/components/button/button';
import { TextInput } from '@shared/components/input/input';

/**
 * Password recovery request form.
 *
 * Submits the email to the backend and shows a confirmation message on success rather
 * than navigating away. The backend always returns success regardless of whether the
 * email exists — revealing that is an information leak.
 *
 * Uses the service directly rather than the store, because this action has no effect
 * on the application's auth state (nobody becomes signed in).
 */
@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink, TextInput, Button],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPassword {
  private readonly authService = inject(AuthService);

  protected readonly loginUrl = APP_URLS.auth.login;
  protected readonly loading = signal(false);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly errorMessage = signal<string | null>(null);

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

    this.loading.set(true);
    this.errorMessage.set(null);

    const { email } = this.form.getRawValue();

    this.authService
      .forgotPassword({ email })
      .pipe(
        tap((response) => {
          this.loading.set(false);
          this.successMessage.set(response.message);
        }),
      )
      .subscribe({
        error: (err: Error) => {
          this.loading.set(false);
          this.errorMessage.set(err.message);
        },
      });
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
