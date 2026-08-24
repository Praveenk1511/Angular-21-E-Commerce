import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import type { InventoryRecord, StockStatus } from '@core/models';
import { Badge, type BadgeVariant } from '@shared/components/badge/badge';
import { Button } from '@shared/components/button/button';
import { EmptyState } from '@shared/components/empty-state/empty-state';
import { Icon } from '@shared/components/icon/icon';
import { ToastService } from '@shared/components/toast/toast.service';
import { AdminInventoryStore, type AdjustStockPayload } from '@state/admin-inventory.store';

/**
 * Admin Inventory Management Page (/admin/inventory).
 *
 * Renders SKU Stock Data Table, Low Stock & Out of Stock filter pills,
 * Stock Threshold configuration, Stock Adjustment Reactive Form, Stock Movement Audit History drawer,
 * and syncs stock state with product catalog.
 */
@Component({
  selector: 'app-admin-inventory',
  imports: [
    ReactiveFormsModule,
    DatePipe,
    Badge,
    Button,
    Icon,
    EmptyState,
  ],
  templateUrl: './admin-inventory.html',
  styleUrl: './admin-inventory.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminInventory {
  protected readonly store = inject(AdminInventoryStore);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  protected readonly formSubmitted = signal<boolean>(false);

  // ---------- Reactive Adjustment Form ----------

  protected readonly adjustForm: FormGroup = this.fb.group({
    productId: ['', Validators.required],
    adjustmentType: ['add' as 'add' | 'subtract', Validators.required],
    quantity: [10, [Validators.required, Validators.min(1)]],
    reason: ['Supplier Restock Shipment', [Validators.required, Validators.minLength(4)]],
    reorderLevel: [5, [Validators.required, Validators.min(0)]],
  });

  protected isControlInvalid(controlName: string): boolean {
    const control = this.adjustForm.get(controlName);
    return !!(control && control.invalid && (control.touched || this.formSubmitted()));
  }

  // ---------- Action Handlers ----------

  protected openAdjustModal(record: InventoryRecord): void {
    this.formSubmitted.set(false);
    this.adjustForm.reset({
      productId: record.productId,
      adjustmentType: 'add',
      quantity: 10,
      reason: 'Supplier Restock Shipment',
      reorderLevel: record.reorderLevel,
    });
    this.store.openAdjustModal(record);
  }

  protected submitAdjustment(): void {
    this.formSubmitted.set(true);

    if (this.adjustForm.invalid) {
      this.adjustForm.markAllAsTouched();
      this.toast.error('Invalid Adjustment Details', 'Please fill out all required fields.');
      return;
    }

    const val = this.adjustForm.value;
    const rawQty = Number(val.quantity);
    const delta = val.adjustmentType === 'add' ? rawQty : -rawQty;

    const payload: AdjustStockPayload = {
      productId: val.productId,
      delta,
      reason: val.reason,
      newReorderLevel: Number(val.reorderLevel),
    };

    const res = this.store.adjustStock(payload);
    if (res.success) {
      this.toast.success('Stock Level Adjusted', res.message);
    } else {
      this.toast.error('Adjustment Failed', res.message);
    }
  }

  protected getStockBadgeVariant(status: StockStatus): BadgeVariant {
    switch (status) {
      case 'in-stock':
        return 'success';
      case 'low-stock':
        return 'warning';
      case 'out-of-stock':
        return 'danger';
      default:
        return 'neutral';
    }
  }
}
