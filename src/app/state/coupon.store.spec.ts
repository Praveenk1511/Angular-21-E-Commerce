import { TestBed } from '@angular/core/testing';

import { CouponStore } from './coupon.store';

describe('CouponStore Validation Engine', () => {
  let store: CouponStore;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    store = TestBed.inject(CouponStore);
  });

  it('should validate valid percentage coupon WELCOME10', () => {
    const res = store.validateCoupon('WELCOME10', 5000); // £50 spend
    expect(res.valid).toBe(true);
    expect(res.discountMinor).toBe(500); // 10% of £50 = £5.00
  });

  it('should reject invalid promo code', () => {
    const res = store.validateCoupon('INVALID99', 5000);
    expect(res.valid).toBe(false);
    expect(res.message).toBe('Invalid promo code.');
  });

  it('should reject expired coupon SPRING20', () => {
    const res = store.validateCoupon('SPRING20', 5000);
    expect(res.valid).toBe(false);
    expect(res.message).toContain('expired');
  });

  it('should reject minimum spend failure for DESK25', () => {
    const res = store.validateCoupon('DESK25', 5000); // £50 spend < £200 min
    expect(res.valid).toBe(false);
    expect(res.message).toContain('Minimum order spend');
  });

  it('should apply valid coupon and persist to state', () => {
    const res = store.applyCoupon('WELCOME10', 5000);
    expect(res.valid).toBe(true);
    expect(store.appliedCoupon()?.code).toBe('WELCOME10');

    store.removeCoupon();
    expect(store.appliedCoupon()).toBeNull();
  });
});
