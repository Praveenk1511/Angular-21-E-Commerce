import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Button } from '@shared/components/button/button';
import { Icon } from '@shared/components/icon/icon';
import { ToastService } from '@shared/components/toast/toast.service';
import { AddressStore } from '@state/address.store';
import { AuthStore } from '@state/auth.store';
import { OrdersStore } from '@state/orders.store';

/**
 * Profile Overview and Personal Info Editor Page (/profile/overview).
 *
 * Renders personal details Reactive Form and account overview summary card.
 */
@Component({
  selector: 'app-profile-overview',
  imports: [ReactiveFormsModule, DatePipe, Button, Icon],
  templateUrl: './profile-overview.html',
  styleUrl: './profile-overview.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileOverview {
  protected readonly authStore = inject(AuthStore);
  protected readonly ordersStore = inject(OrdersStore);
  protected readonly addressStore = inject(AddressStore);

  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  protected submitted = false;

  private readonly user = this.authStore.currentUser();

  protected readonly profileForm: FormGroup = this.fb.group({
    firstName: [this.user?.firstName ?? 'Alex', [Validators.required, Validators.minLength(2)]],
    lastName: [this.user?.lastName ?? 'Morgan', [Validators.required, Validators.minLength(2)]],
    email: [this.user?.email ?? 'alex.morgan@example.com', [Validators.required, Validators.email]],
    phone: [this.user?.phone ?? '+44 7911 123456', []],
  });

  protected isControlInvalid(controlName: string): boolean {
    const control = this.profileForm.get(controlName);
    return !!(control && control.invalid && (control.touched || this.submitted));
  }

  protected submitProfile(): void {
    this.submitted = true;

    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.toast.error('Invalid Form Data', 'Please correct the errors before saving.');
      return;
    }

    const val = this.profileForm.value as {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };

    this.authStore.updateProfile({
      firstName: val.firstName,
      lastName: val.lastName,
      email: val.email,
      phone: val.phone || null,
    });

    this.toast.success('Profile Saved', 'Your personal account details have been updated.');
    this.submitted = false;
  }
}
