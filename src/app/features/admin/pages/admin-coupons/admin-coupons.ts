import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import type { Coupon, CouponKind, CouponStatus } from '@core/models';
import { Badge, type BadgeVariant } from '@shared/components/badge/badge';
import { Button } from '@shared/components/button/button';
import { EmptyState } from '@shared/components/empty-state/empty-state';
import { Icon } from '@shared/components/icon/icon';
import { ToastService } from '@shared/components/toast/toast.service';
import { PricePipe } from '@shared/pipes/price.pipe';
import { CouponStore, type SaveCouponPayload } from '@state/coupon.store';

/**
 * Admin Coupon & Promotions Management Page (/admin/coupons).
 *
 * Renders Promo Code Data Table, Status Filter pills, Search bar, Reactive Form for creating/editing coupons,
 * Status Toggling (Active / Disabled), and Destructive Confirmation Modals.
 */
@Component({
  selector: 'app-admin-coupons',
  imports: [
    ReactiveFormsModule,
    DatePipe,
    Badge,
    Button,
    Icon,
    EmptyState,
    PricePipe,
  ],
  templateUrl: './admin-coupons.html',
  styleUrl: './admin-coupons.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCoupons {
  protected readonly store = inject(CouponStore);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  protected readonly formSubmitted = signal<boolean>(false);

  // ---------- Reactive Coupon Form ----------

  protected readonly couponForm: FormGroup = this.fb.group({
    id: [''],
    code: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9_-]+$/)]],
    kind: ['percentage' as CouponKind, Validators.required],
    description: ['', [Validators.required, Validators.minLength(5)]],
    value: [10, [Validators.required, Validators.min(0.01)]],
    minimumSpend: [25.0, [Validators.required, Validators.min(0)]],
    maximumDiscount: [null as number | null],
    startsAt: [new Date().toISOString().slice(0, 16), Validators.required],
    endsAt: [null as string | null],
    usageLimit: [null as number | null],
    status: ['active' as CouponStatus, Validators.required],
  });

  protected isControlInvalid(controlName: string): boolean {
    const control = this.couponForm.get(controlName);
    return !!(control && control.invalid && (control.touched || this.formSubmitted()));
  }

  // ---------- Action Handlers ----------

  protected openAddModal(): void {
    this.formSubmitted.set(false);
    this.couponForm.reset({
      id: '',
      code: '',
      kind: 'percentage',
      description: '',
      value: 10,
      minimumSpend: 25.0,
      maximumDiscount: null,
      startsAt: new Date().toISOString().slice(0, 16),
      endsAt: null,
      usageLimit: null,
      status: 'active',
    });
    this.store.openAddModal();
  }

  protected openEditModal(coupon: Coupon): void {
    this.formSubmitted.set(false);
    const valAmount = coupon.kind === 'percentage' ? coupon.value : coupon.value / 100;
    const minSpend = coupon.minimumSpendMinor / 100;
    const maxDiscount = coupon.maximumDiscountMinor ? coupon.maximumDiscountMinor / 100 : null;

    this.couponForm.patchValue({
      id: coupon.id,
      code: coupon.code,
      kind: coupon.kind,
      description: coupon.description,
      value: valAmount,
      minimumSpend: minSpend,
      maximumDiscount: maxDiscount,
      startsAt: coupon.startsAt ? new Date(coupon.startsAt).toISOString().slice(0, 16) : '',
      endsAt: coupon.endsAt ? new Date(coupon.endsAt).toISOString().slice(0, 16) : null,
      usageLimit: coupon.usageLimit,
      status: coupon.status,
    });
    this.store.openEditModal(coupon);
  }

  protected saveCoupon(): void {
    this.formSubmitted.set(true);

    if (this.couponForm.invalid) {
      this.couponForm.markAllAsTouched();
      this.toast.error('Invalid Coupon Details', 'Please fill out all required fields.');
      return;
    }

    const val = this.couponForm.value;

    const payload: SaveCouponPayload = {
      id: val.id || undefined,
      code: val.code,
      kind: val.kind,
      description: val.description,
      value: Number(val.value),
      minimumSpend: Number(val.minimumSpend),
      maximumDiscount: val.maximumDiscount ? Number(val.maximumDiscount) : null,
      startsAt: val.startsAt,
      endsAt: val.endsAt || null,
      usageLimit: val.usageLimit ? Number(val.usageLimit) : null,
      status: val.status,
    };

    const saved = this.store.saveCoupon(payload);
    this.toast.success(
      'Coupon Saved',
      `Promo code "${saved.code}" has been ${val.id ? 'updated' : 'created'}.`,
    );
  }

  protected toggleCouponStatus(coupon: Coupon): void {
    this.store.toggleStatus(coupon.id);
    const newSt = coupon.status === 'disabled' ? 'active' : 'disabled';
    this.toast.show({
      variant: 'info',
      title: 'Status Toggled',
      message: `Promo code ${coupon.code} status set to ${newSt}.`,
    });
  }

  protected confirmDeleteCoupon(): void {
    const target = this.store.confirmingDeleteCoupon();
    if (!target) return;

    this.store.deleteCoupon(target.id);
    this.toast.show({
      variant: 'info',
      title: 'Coupon Deleted',
      message: `Promo code "${target.code}" was permanently deleted.`,
    });
  }

  protected getCouponBadgeVariant(status: CouponStatus): BadgeVariant {
    switch (status) {
      case 'active':
        return 'success';
      case 'scheduled':
        return 'brand';
      case 'exhausted':
        return 'warning';
      case 'expired':
      case 'disabled':
      default:
        return 'neutral';
    }
  }
}
