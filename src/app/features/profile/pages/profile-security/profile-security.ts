import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

import { Button } from '@shared/components/button/button';
import { Icon } from '@shared/components/icon/icon';
import { ToastService } from '@shared/components/toast/toast.service';
import { AuthStore } from '@state/auth.store';

export const passwordMatchValidator: ValidatorFn = (
  group: AbstractControl,
): ValidationErrors | null => {
  const newPass = group.get('newPassword')?.value as string;
  const confirmPass = group.get('confirmPassword')?.value as string;

  return newPass && confirmPass && newPass !== confirmPass ? { passwordMismatch: true } : null;
};

/**
 * Security and Change Password Page (/profile/security).
 *
 * Renders Change Password Reactive Form with live validation, password matching checks,
 * and security recommendations.
 */
@Component({
  selector: 'app-profile-security',
  imports: [ReactiveFormsModule, Button, Icon],
  templateUrl: './profile-security.html',
  styleUrl: './profile-security.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileSecurity {
  protected readonly authStore = inject(AuthStore);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  protected submitted = false;

  protected readonly passwordForm: FormGroup = this.fb.group(
    {
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/),
        ],
      ],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator },
  );

  protected isControlInvalid(controlName: string): boolean {
    const control = this.passwordForm.get(controlName);
    return !!(control && control.invalid && (control.touched || this.submitted));
  }

  protected get isPasswordMismatch(): boolean {
    return (
      this.submitted &&
      !!this.passwordForm.errors?.['passwordMismatch'] &&
      !!this.passwordForm.get('confirmPassword')?.touched
    );
  }

  protected async submitPasswordChange(): Promise<void> {
    this.submitted = true;

    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      this.toast.error('Invalid Password Details', 'Please verify your input fields.');
      return;
    }

    const { currentPassword, newPassword } = this.passwordForm.value as {
      currentPassword: string;
      newPassword: string;
    };

    const success = await this.authStore.changePassword(currentPassword, newPassword);

    if (success) {
      this.toast.success('Password Updated', 'Your account password has been changed.');
      this.passwordForm.reset();
      this.submitted = false;
    }
  }
}
