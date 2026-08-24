import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import type { Address } from '@core/models';
import { Button } from '@shared/components/button/button';
import { Icon } from '@shared/components/icon/icon';
import { ToastService } from '@shared/components/toast/toast.service';
import { AddressStore } from '@state/address.store';

/**
 * Address form modal / panel for adding or editing saved delivery addresses.
 * Built with Angular Reactive Forms (`FormGroup`) with real-time field validations.
 */
@Component({
  selector: 'app-address-form',
  imports: [ReactiveFormsModule, Button, Icon],
  templateUrl: './address-form.html',
  styleUrl: './address-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressForm {
  readonly initialAddress = input<Address | null>(null);
  readonly mode = input<'add' | 'edit'>('add');

  readonly cancel = output<void>();
  readonly saved = output<void>();

  private readonly fb = inject(FormBuilder);
  protected readonly addressStore = inject(AddressStore);
  private readonly toast = inject(ToastService);

  protected readonly form: FormGroup = this.fb.group({
    label: ['Home', [Validators.required]],
    recipient: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required, Validators.minLength(10)]],
    line1: ['', [Validators.required]],
    line2: [''],
    city: ['', [Validators.required]],
    region: ['', [Validators.required]],
    postcode: ['', [Validators.required, Validators.minLength(4)]],
    isDefault: [false],
  });

  protected isSubmitted = false;

  constructor() {
    effect(() => {
      const addr = this.initialAddress();
      if (addr && this.mode() === 'edit') {
        this.form.patchValue({
          label: addr.label,
          recipient: addr.recipient,
          phone: addr.phone ?? '',
          line1: addr.line1,
          line2: addr.line2 ?? '',
          city: addr.city,
          region: addr.region,
          postcode: addr.postcode,
          isDefault: addr.isDefault,
        });
      } else {
        this.form.reset({
          label: 'Home',
          recipient: '',
          phone: '',
          line1: '',
          line2: '',
          city: '',
          region: '',
          postcode: '',
          isDefault: false,
        });
      }
    });
  }

  protected isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!(control && control.invalid && (control.touched || this.isSubmitted));
  }

  protected onSubmit(): void {
    this.isSubmitted = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error(
        'Invalid Form',
        'Please check all required fields before saving your address.',
      );
      return;
    }

    const val = this.form.value as {
      label: string;
      recipient: string;
      phone: string;
      line1: string;
      line2: string;
      city: string;
      region: string;
      postcode: string;
      isDefault: boolean;
    };

    if (this.mode() === 'edit' && this.initialAddress()) {
      const editId = this.initialAddress()!.id;
      this.addressStore.updateAddress(editId, {
        label: val.label,
        recipient: val.recipient,
        phone: val.phone,
        line1: val.line1,
        line2: val.line2 || null,
        city: val.city,
        region: val.region,
        postcode: val.postcode,
        countryCode: 'GB',
        isDefault: val.isDefault,
      });
      this.toast.success('Address Updated', 'Your delivery address has been saved.');
    } else {
      this.addressStore.addAddress({
        type: 'shipping',
        label: val.label,
        recipient: val.recipient,
        phone: val.phone,
        line1: val.line1,
        line2: val.line2 || null,
        city: val.city,
        region: val.region,
        postcode: val.postcode,
        countryCode: 'GB',
        isDefault: val.isDefault,
      });
      this.toast.success('New Address Added', 'Your new delivery address is saved and selected.');
    }

    this.saved.emit();
  }

  protected onCancel(): void {
    this.cancel.emit();
  }
}
