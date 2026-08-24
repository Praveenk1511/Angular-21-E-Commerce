import { Injectable, computed, signal } from '@angular/core';

import type { Address } from '@core/models';

const ADDRESSES_STORAGE_KEY = 'lumen_saved_addresses';

const MOCK_INITIAL_ADDRESSES: readonly Address[] = [
  {
    id: 'addr-1',
    userId: 'user-1',
    type: 'shipping',
    label: 'Home',
    recipient: 'Alex Morgan',
    line1: '742 Evergreen Terrace',
    line2: 'Apt 4B',
    city: 'London',
    region: 'Greater London',
    postcode: 'SW1A 1AA',
    countryCode: 'GB',
    phone: '+44 7911 123456',
    isDefault: true,
  },
  {
    id: 'addr-2',
    userId: 'user-1',
    type: 'shipping',
    label: 'Office',
    recipient: 'Alex Morgan (TechCorp)',
    line1: '100 Victoria Embankment',
    line2: 'Floor 5',
    city: 'London',
    region: 'Greater London',
    postcode: 'EC4Y 0DH',
    countryCode: 'GB',
    phone: '+44 20 7946 0912',
    isDefault: false,
  },
];

export type AddressFormMode = 'add' | 'edit';

/**
 * Root state manager for User Delivery Addresses during Checkout.
 *
 * Manages saved address cards, selection, setting default address, adding new addresses,
 * editing existing addresses, deleting addresses, and localStorage persistence.
 */
@Injectable({ providedIn: 'root' })
export class AddressStore {
  // ---------- Internal State ----------
  private readonly addresses = signal<readonly Address[]>([]);
  private readonly selectedId = signal<string | null>(null);

  /** Controls modal / panel form visibility for Add / Edit. */
  readonly isFormOpen = signal<boolean>(false);
  readonly formMode = signal<AddressFormMode>('add');
  readonly editingAddressId = signal<string | null>(null);

  // ---------- Public Derived State ----------
  readonly savedAddresses = this.addresses.asReadonly();
  readonly selectedAddressId = this.selectedId.asReadonly();

  readonly defaultAddress = computed(
    () => this.addresses().find((a) => a.isDefault) ?? this.addresses()[0] ?? null,
  );

  readonly selectedAddress = computed(() => {
    const selId = this.selectedId();
    if (selId) {
      const found = this.addresses().find((a) => a.id === selId);
      if (found) {
        return found;
      }
    }
    return this.defaultAddress();
  });

  readonly editingAddress = computed(() => {
    const editId = this.editingAddressId();
    if (!editId) {
      return null;
    }
    return this.addresses().find((a) => a.id === editId) ?? null;
  });

  constructor() {
    this.readStoredAddresses();
  }

  // ---------- Actions ----------

  /**
   * Selects an address for checkout delivery.
   */
  selectAddress(id: string): void {
    if (this.addresses().some((a) => a.id === id)) {
      this.selectedId.set(id);
    }
  }

  /**
   * Opens the form panel to add a new address.
   */
  openAddForm(): void {
    this.formMode.set('add');
    this.editingAddressId.set(null);
    this.isFormOpen.set(true);
  }

  /**
   * Opens the form panel to edit an existing address.
   */
  openEditForm(id: string): void {
    if (this.addresses().some((a) => a.id === id)) {
      this.formMode.set('edit');
      this.editingAddressId.set(id);
      this.isFormOpen.set(true);
    }
  }

  /**
   * Closes the address form panel.
   */
  closeForm(): void {
    this.isFormOpen.set(false);
    this.editingAddressId.set(null);
  }

  /**
   * Adds a new address to saved list and selects it.
   */
  addAddress(data: Omit<Address, 'id' | 'userId'>): Address {
    const newId = `addr-${Date.now()}`;
    const shouldBeDefault = data.isDefault || this.addresses().length === 0;

    let currentList = [...this.addresses()];

    if (shouldBeDefault) {
      currentList = currentList.map((a) => ({ ...a, isDefault: false }));
    }

    const newAddress: Address = {
      ...data,
      id: newId,
      userId: 'user-1',
      isDefault: shouldBeDefault,
    };

    const updated = [...currentList, newAddress];
    this.updateState(updated);
    this.selectedId.set(newId);
    this.closeForm();

    return newAddress;
  }

  /**
   * Updates an existing address.
   */
  updateAddress(id: string, data: Partial<Omit<Address, 'id' | 'userId'>>): void {
    let currentList = [...this.addresses()];
    const index = currentList.findIndex((a) => a.id === id);

    if (index === -1) {
      return;
    }

    if (data.isDefault) {
      currentList = currentList.map((a) => ({ ...a, isDefault: false }));
    }

    const existing = currentList[index]!;
    currentList[index] = {
      ...existing,
      ...data,
    };

    this.updateState(currentList);
    this.closeForm();
  }

  /**
   * Deletes an address. Reassigns selection if deleted address was active.
   */
  deleteAddress(id: string): void {
    const currentList = this.addresses().filter((a) => a.id !== id);

    // If we deleted the default, set first remaining as default
    if (currentList.length > 0 && !currentList.some((a) => a.isDefault)) {
      currentList[0] = { ...currentList[0]!, isDefault: true };
    }

    this.updateState(currentList);

    if (this.selectedId() === id) {
      const fallback = currentList[0]?.id ?? null;
      this.selectedId.set(fallback);
    }
  }

  /**
   * Sets an address as the default delivery address.
   */
  setDefaultAddress(id: string): void {
    const updated = this.addresses().map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    this.updateState(updated);
  }

  // ---------- Internals ----------

  private updateState(list: readonly Address[]): void {
    this.addresses.set(list);
    this.persistAddresses(list);
  }

  private readStoredAddresses(): void {
    try {
      const raw = localStorage.getItem(ADDRESSES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.addresses.set(parsed as Address[]);
          const def = (parsed as Address[]).find((a) => a.isDefault);
          this.selectedId.set(def ? def.id : (parsed[0] as Address).id);
          return;
        }
      }
    } catch {
      // Storage restricted
    }

    // Default to mock initial addresses if no stored items
    this.addresses.set(MOCK_INITIAL_ADDRESSES);
    this.selectedId.set(MOCK_INITIAL_ADDRESSES[0]!.id);
    this.persistAddresses(MOCK_INITIAL_ADDRESSES);
  }

  private persistAddresses(list: readonly Address[]): void {
    try {
      localStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(list));
    } catch {
      // Storage full
    }
  }
}
