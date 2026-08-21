import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { APP_URLS } from '@core/config/route-paths';
import { Button } from '@shared/components/button/button';
import { TextInput } from '@shared/components/input/input';
import { AuthStore } from '@state/auth.store';

/**
 * Sign-in form.
 *
 * Deliberately minimal: email and password, nothing else. The store owns the loading
 * state and error message, and handles the redirect on success — this component is
 * purely a form that calls `authStore.login(...)`.
 */
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, TextInput, Button],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  protected readonly auth = inject(AuthStore);
  protected readonly registerUrl = APP_URLS.auth.register;
  protected readonly forgotUrl = APP_URLS.auth.forgotPassword;

  protected readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      return;
    }

    const { email, password } = this.form.getRawValue();
    this.auth.login({ email, password });
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

  protected passwordError(): string | null {
    const control = this.form.controls.password;

    if (!control.touched || control.valid) {
      return null;
    }

    return 'Enter your password.';
  }
}
