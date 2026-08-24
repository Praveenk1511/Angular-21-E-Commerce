import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { AddressForm } from '@shared/components/address-form/address-form';
import { Badge } from '@shared/components/badge/badge';
import { Button } from '@shared/components/button/button';
import { Icon } from '@shared/components/icon/icon';
import { ToastService } from '@shared/components/toast/toast.service';
import { AddressStore } from '@state/address.store';

/**
 * Saved Addresses Management Page (/profile/addresses).
 *
 * Renders address grid, default address status badges, and triggers for Add, Edit, Delete, and Set Default.
 */
@Component({
  selector: 'app-profile-addresses',
  imports: [Badge, Button, Icon, AddressForm],
  templateUrl: './profile-addresses.html',
  styleUrl: './profile-addresses.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileAddresses {
  protected readonly addressStore = inject(AddressStore);
  private readonly toast = inject(ToastService);

  protected selectAddress(id: string): void {
    this.addressStore.selectAddress(id);
  }

  protected setDefaultAddress(id: string, label: string): void {
    this.addressStore.setDefaultAddress(id);
    this.toast.success('Default Address Updated', `${label} is now your default address.`);
  }

  protected deleteAddress(id: string, label: string): void {
    this.addressStore.deleteAddress(id);
    this.toast.show({
      variant: 'info',
      title: 'Address Removed',
      message: `${label} address has been removed.`,
    });
  }
}
