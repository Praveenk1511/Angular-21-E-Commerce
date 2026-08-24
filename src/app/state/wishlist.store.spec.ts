import { TestBed } from '@angular/core/testing';

import type { ProductSummary } from '@core/models';
import { WishlistStore } from './wishlist.store';

describe('WishlistStore', () => {
  let store: WishlistStore;

  const mockProduct: ProductSummary = {
    id: 'prod-test-2',
    slug: 'wireless-mouse',
    name: 'Wireless Mouse',
    brandId: 'b-1',
    categoryId: 'c-2',
    summary: 'Precision mouse',
    price: { amountMinor: 4999, currency: 'INR' },
    thumbnail: { url: '/thumb.png', alt: 'Mouse' },
    rating: { average: 4.8, count: 5, distribution: [0, 0, 0, 1, 4] },
    stock: { status: 'in-stock', available: 20 },
    badges: [],
    createdAt: new Date().toISOString(),
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    store = TestBed.inject(WishlistStore);
    store.clearWishlist();
  });

  it('should start empty', () => {
    expect(store.isEmpty()).toBe(true);
    expect(store.wishlistCount()).toBe(0);
  });

  it('should toggle item in wishlist', () => {
    const addRes = store.toggleWishlist(mockProduct);
    expect(addRes.added).toBe(true);
    expect(store.isWishlisted(mockProduct.id)).toBe(true);

    const removeRes = store.toggleWishlist(mockProduct);
    expect(removeRes.added).toBe(false);
    expect(store.isWishlisted(mockProduct.id)).toBe(false);
  });

  it('should maintain wishlistedProductIds computed set', () => {
    store.toggleWishlist(mockProduct);
    expect(store.wishlistedProductIds().has(mockProduct.id)).toBe(true);
  });
});
