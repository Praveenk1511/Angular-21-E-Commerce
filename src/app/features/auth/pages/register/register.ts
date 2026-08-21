import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';

import { APP_URLS } from '@core/config/route-paths';
import { Button } from '@shared/components/button/button';
import { Checkbox } from '@shared/components/checkbox/checkbox';
import { TextInput } from '@shared/components/input/input';
import { AuthStore } from '@state/auth.store';

const MIN_PASSWORD = 8;

/** Cross-field validator: `confirmPassword` must equal `password`. */
function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value as string;
  const confirm = group.get('confirmPassword')?.value as string;

  return password && confirm && password !== confirm ? { passwordsMismatch: true } : null;
}

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, TextInput, Checkbox, Button],
  templateUrl: './register.html',
  styleUrl: './register.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Register {
  protected readonly auth = inject(AuthStore);
  protected readonly loginUrl = APP_URLS.auth.login;

  protected readonly form = new FormGroup(
    {
      firstName: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      lastName: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(MIN_PASSWORD)],
      }),
      confirmPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      marketingOptIn: new FormControl(false, { nonNullable: true }),
    },
    { validators: passwordsMatch },
  );

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      return;
    }

    const { firstName, lastName, email, password, marketingOptIn } = this.form.getRawValue();
    this.auth.register({ firstName, lastName, email, password, marketingOptIn });
  }

  protected fieldError(name: string): string | null {
    const control = this.form.get(name);

    if (!control?.touched || control.valid) {
      return null;
    }

    if (control.hasError('required')) {
      switch (name) {
        case 'firstName':
          return 'Enter your first name.';
        case 'lastName':
          return 'Enter your last name.';
        case 'email':
          return 'Enter your email address.';
        case 'password':
          return 'Choose a password.';
        case 'confirmPassword':
          return 'Confirm your password.';
        default:
          return 'This field is required.';
      }
    }

    if (control.hasError('email')) {
      return 'Enter a valid email address.';
    }

    if (control.hasError('minlength')) {
      return `Must be at least ${MIN_PASSWORD} characters.`;
    }

    return null;
  }

  protected confirmError(): string | null {
    const control = this.form.controls.confirmPassword;
    const fieldErr = this.fieldError('confirmPassword');

    if (fieldErr) {
      return fieldErr;
    }

    if (control.touched && this.form.hasError('passwordsMismatch')) {
      return 'Passwords do not match.';
    }

    return null;
  }
}
