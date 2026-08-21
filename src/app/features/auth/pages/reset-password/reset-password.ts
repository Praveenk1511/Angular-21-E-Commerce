import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { tap } from 'rxjs';

import { APP_URLS } from '@core/config/route-paths';
import { AuthService } from '@core/services/auth.service';
import { Button } from '@shared/components/button/button';
import { TextInput } from '@shared/components/input/input';

const MIN_PASSWORD = 8;

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value as string;
  const confirm = group.get('confirmPassword')?.value as string;

  return password && confirm && password !== confirm ? { passwordsMismatch: true } : null;
}

/**
 * Password reset form.
 *
 * The token arrives in the query string (`/auth/reset-password?token=xyz`) and is
 * bound to a signal input via `withComponentInputBinding()`.
 */
@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, RouterLink, TextInput, Button],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPassword {
  private readonly authService = inject(AuthService);

  /** Bound from the `?token=` query parameter by the router. */
  readonly token = input('');

  protected readonly loginUrl = APP_URLS.auth.login;
  protected readonly loading = signal(false);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = new FormGroup(
    {
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(MIN_PASSWORD)],
      }),
      confirmPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    { validators: passwordsMatch },
  );

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      return;
    }

    if (!this.token()) {
      this.errorMessage.set('The reset link is invalid or has expired.');

      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const { password } = this.form.getRawValue();

    this.authService
      .resetPassword({ token: this.token(), password })
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

  protected passwordError(): string | null {
    const control = this.form.controls.password;

    if (!control.touched || control.valid) {
      return null;
    }

    if (control.hasError('required')) {
      return 'Choose a new password.';
    }

    return `Must be at least ${MIN_PASSWORD} characters.`;
  }

  protected confirmError(): string | null {
    const control = this.form.controls.confirmPassword;

    if (!control.touched || control.valid) {
      return null;
    }

    if (control.hasError('required')) {
      return 'Confirm your new password.';
    }

    if (this.form.hasError('passwordsMismatch')) {
      return 'Passwords do not match.';
    }

    return null;
  }
}
