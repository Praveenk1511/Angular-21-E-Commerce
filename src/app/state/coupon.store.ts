import { Injectable, computed, signal } from '@angular/core';

import type { Coupon, CouponKind, CouponStatus } from '@core/models';
import { COUPON_SEEDS } from '@mock-data/coupons.mock';

const ADMIN_COUPONS_KEY = 'lumen_admin_coupons';
const APPLIED_COUPON_KEY = 'lumen_applied_coupon';

export interface ValidationResponse {
  readonly valid: boolean;
  readonly coupon: Coupon | null;
  readonly discountMinor: number;
  readonly message: string;
}

export interface SaveCouponPayload {
  readonly id?: string;
  readonly code: string;
  readonly kind: CouponKind;
  readonly description: string;
  readonly value: number;
  readonly minimumSpend: number;
  readonly maximumDiscount?: number | null;
  readonly startsAt: string;
  readonly endsAt?: string | null;
  readonly usageLimit?: number | null;
  readonly status: CouponStatus;
}

/**
 * Root state manager for Customer Coupon validation/application and
 * Admin Promotions & Coupon CRUD, search filtering, and deletion confirmation.
 */
@Injectable({ providedIn: 'root' })
export class CouponStore {
  // ---------- State Signals ----------
  private readonly couponsSignal = signal<readonly Coupon[]>([]);
  readonly appliedCoupon = signal<Coupon | null>(null);
  readonly validationError = signal<string | null>(null);

  readonly searchQuery = signal<string>('');
  readonly statusFilter = signal<CouponStatus | 'all'>('all');

  readonly activePage = signal<number>(1);
  readonly pageSize = signal<number>(5);

  readonly isFormOpen = signal<boolean>(false);
  readonly editingCoupon = signal<Coupon | null>(null);
  readonly confirmingDeleteCoupon = signal<Coupon | null>(null);

  // ---------- Derived Signals ----------

  readonly paginatedData = computed(() => {
    let list = [...this.couponsSignal()];
    const q = this.searchQuery().trim().toLowerCase();
    const st = this.statusFilter();

    if (q) {
      list = list.filter(
        (c) =>
          c.code.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q),
      );
    }

    if (st !== 'all') {
      list = list.filter((c) => c.status === st);
    }

    const totalCount = list.length;
    const size = this.pageSize();
    const totalPages = Math.max(1, Math.ceil(totalCount / size));
    const currentPage = Math.min(this.activePage(), totalPages);

    const startIndex = (currentPage - 1) * size;
    const items = list.slice(startIndex, startIndex + size);

    return {
      items,
      totalCount,
      totalPages,
      currentPage,
    };
  });

  readonly totalCount = computed(() => this.couponsSignal().length);

  constructor() {
    this.readStoredData();
  }

  // ---------- Customer Validation Engine ----------

  validateCoupon(code: string, subtotalMinor: number): ValidationResponse {
    const formatted = code.trim().toUpperCase();
    if (!formatted) {
      return { valid: false, coupon: null, discountMinor: 0, message: 'Please enter a promo code.' };
    }

    const coupon = this.couponsSignal().find((c) => c.code.toUpperCase() === formatted);
    if (!coupon) {
      return { valid: false, coupon: null, discountMinor: 0, message: 'Invalid promo code.' };
    }

    if (coupon.status === 'disabled') {
      return { valid: false, coupon: null, discountMinor: 0, message: 'This promo code is currently inactive.' };
    }

    const now = new Date().getTime();
    const startMs = new Date(coupon.startsAt).getTime();
    if (startMs > now) {
      return { valid: false, coupon: null, discountMinor: 0, message: 'This promo code has not started yet.' };
    }

    if (coupon.endsAt) {
      const endMs = new Date(coupon.endsAt).getTime();
      if (endMs < now) {
        return { valid: false, coupon: null, discountMinor: 0, message: 'This promo code has expired.' };
      }
    }

    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      return { valid: false, coupon: null, discountMinor: 0, message: 'This promo code usage limit has been reached.' };
    }

    if (subtotalMinor < coupon.minimumSpendMinor) {
      const requiredSpend = (coupon.minimumSpendMinor / 100).toFixed(2);
      return {
        valid: false,
        coupon: null,
        discountMinor: 0,
        message: `Minimum order spend of £${requiredSpend} required for this coupon.`,
      };
    }

    // Calculate discount amount
    let discount = 0;
    if (coupon.kind === 'percentage') {
      discount = Math.round(subtotalMinor * (coupon.value / 100));
      if (coupon.maximumDiscountMinor !== null && coupon.maximumDiscountMinor > 0) {
        discount = Math.min(discount, coupon.maximumDiscountMinor);
      }
    } else if (coupon.kind === 'fixed') {
      discount = Math.min(coupon.value, subtotalMinor);
    } else if (coupon.kind === 'free-shipping') {
      discount = 499; // Standard shipping fee
    }

    return {
      valid: true,
      coupon,
      discountMinor: Math.max(0, discount),
      message: `Promo code ${coupon.code} applied successfully!`,
    };
  }

  applyCoupon(code: string, subtotalMinor: number): ValidationResponse {
    const res = this.validateCoupon(code, subtotalMinor);
    if (res.valid && res.coupon) {
      this.appliedCoupon.set(res.coupon);
      this.validationError.set(null);
      this.persistData(APPLIED_COUPON_KEY, res.coupon);
    } else {
      this.validationError.set(res.message);
    }
    return res;
  }

  removeCoupon(): void {
    this.appliedCoupon.set(null);
    this.validationError.set(null);
    try {
      localStorage.removeItem(APPLIED_COUPON_KEY);
    } catch {
      // Swallowed
    }
  }

  // ---------- Admin Filter & Modal Actions ----------

  setSearchQuery(q: string): void {
    this.searchQuery.set(q);
    this.activePage.set(1);
  }

  setStatusFilter(st: CouponStatus | 'all'): void {
    this.statusFilter.set(st);
    this.activePage.set(1);
  }

  setPage(page: number): void {
    this.activePage.set(page);
  }

  openAddModal(): void {
    this.editingCoupon.set(null);
    this.isFormOpen.set(true);
  }

  openEditModal(coupon: Coupon): void {
    this.editingCoupon.set(coupon);
    this.isFormOpen.set(true);
  }

  promptDelete(coupon: Coupon): void {
    this.confirmingDeleteCoupon.set(coupon);
  }

  cancelDelete(): void {
    this.confirmingDeleteCoupon.set(null);
  }

  closeModals(): void {
    this.isFormOpen.set(false);
    this.editingCoupon.set(null);
    this.confirmingDeleteCoupon.set(null);
  }

  // ---------- Admin CRUD Actions ----------

  saveCoupon(payload: SaveCouponPayload): Coupon {
    const existing = payload.id
      ? this.couponsSignal().find((c) => c.id === payload.id)
      : null;

    const valueNum = payload.kind === 'percentage'
      ? Math.min(100, Math.max(1, payload.value))
      : Math.round(payload.value * 100);

    const minSpendMinor = Math.round(payload.minimumSpend * 100);
    const maxDiscountMinor = payload.maximumDiscount
      ? Math.round(payload.maximumDiscount * 100)
      : null;

    const saved: Coupon = {
      id: existing ? existing.id : `cpn-${Date.now()}`,
      code: payload.code.toUpperCase().trim(),
      kind: payload.kind,
      description: payload.description.trim(),
      value: valueNum,
      currency: 'INR',
      minimumSpendMinor: minSpendMinor,
      maximumDiscountMinor: maxDiscountMinor,
      startsAt: payload.startsAt ? new Date(payload.startsAt).toISOString() : new Date().toISOString(),
      endsAt: payload.endsAt ? new Date(payload.endsAt).toISOString() : null,
      usageLimit: payload.usageLimit ?? null,
      usageCount: existing ? existing.usageCount : 0,
      status: payload.status,
      appliesToCategoryIds: existing ? existing.appliesToCategoryIds : [],
    };

    const list = [...this.couponsSignal()];
    if (existing) {
      const idx = list.findIndex((c) => c.id === existing.id);
      if (idx !== -1) {
        list[idx] = saved;
      }
    } else {
      list.unshift(saved);
    }

    this.updateCouponsState(list);
    this.closeModals();
    return saved;
  }

  deleteCoupon(id: string): boolean {
    const updated = this.couponsSignal().filter((c) => c.id !== id);
    this.updateCouponsState(updated);
    if (this.appliedCoupon()?.id === id) {
      this.removeCoupon();
    }
    this.confirmingDeleteCoupon.set(null);
    return true;
  }

  toggleStatus(id: string): void {
    const list = [...this.couponsSignal()];
    const idx = list.findIndex((c) => c.id === id);
    if (idx !== -1) {
      const item = list[idx]!;
      const newStatus: CouponStatus = item.status === 'disabled' ? 'active' : 'disabled';
      list[idx] = { ...item, status: newStatus };
      this.updateCouponsState(list);
    }
  }

  // ---------- Internals ----------

  private updateCouponsState(list: readonly Coupon[]): void {
    this.couponsSignal.set(list);
    this.persistData(ADMIN_COUPONS_KEY, list);
  }

  private readStoredData(): void {
    try {
      const raw = localStorage.getItem(ADMIN_COUPONS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.couponsSignal.set(parsed as Coupon[]);
        } else {
          this.couponsSignal.set(COUPON_SEEDS);
          this.persistData(ADMIN_COUPONS_KEY, COUPON_SEEDS);
        }
      } else {
        this.couponsSignal.set(COUPON_SEEDS);
        this.persistData(ADMIN_COUPONS_KEY, COUPON_SEEDS);
      }

      const rawApplied = localStorage.getItem(APPLIED_COUPON_KEY);
      if (rawApplied) {
        const parsedApplied = JSON.parse(rawApplied) as unknown;
        if (parsedApplied && typeof parsedApplied === 'object') {
          this.appliedCoupon.set(parsedApplied as Coupon);
        }
      }
    } catch {
      this.couponsSignal.set(COUPON_SEEDS);
    }
  }

  private persistData(key: string, data: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch {
      // Swallowed
    }
  }
}
