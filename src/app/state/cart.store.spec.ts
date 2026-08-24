import { TestBed } from '@angular/core/testing';

import type { ProductSummary } from '@core/models';
import { CartStore } from './cart.store';

describe('CartStore', () => {
  let store: CartStore;

  const mockProduct: ProductSummary = {
    id: 'prod-test-1',
    slug: 'ergonomic-chair',
    name: 'Ergonomic Chair',
    brandId: 'b-1',
    categoryId: 'c-1',
    summary: 'Great chair',
    price: { amountMinor: 25000, compareAtMinor: 30000, currency: 'INR' },
    thumbnail: { url: '/thumb.png', alt: 'Chair' },
    rating: { average: 5, count: 10, distribution: [0, 0, 0, 0, 10] },
    stock: { status: 'in-stock', available: 10 },
    badges: [],
    createdAt: new Date().toISOString(),
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    store = TestBed.inject(CartStore);
    store.clearCart();
  });

  it('should start with empty cart', () => {
    expect(store.isEmpty()).toBe(true);
    expect(store.itemCount()).toBe(0);
    expect(store.subtotalMinor()).toBe(0);
  });

  it('should add item to cart', () => {
    const res = store.addItem(mockProduct, 2);
    expect(res.success).toBe(true);
    expect(store.isEmpty()).toBe(false);
    expect(store.itemCount()).toBe(2);
    expect(store.subtotalMinor()).toBe(50000);
  });

  it('should clamp quantity to available stock', () => {
    const res = store.addItem(mockProduct, 15);
    expect(res.addedQty).toBe(10);
    expect(store.itemCount()).toBe(10);
  });

  it('should calculate free shipping over £50', () => {
    store.addItem(mockProduct, 1); // £250.00 >= £50.00
    expect(store.shippingMinor()).toBe(0);
  });

  it('should remove item and clear cart', () => {
    store.addItem(mockProduct, 1);
    expect(store.itemCount()).toBe(1);

    store.removeItem(mockProduct.id);
    expect(store.isEmpty()).toBe(true);
  });
});
