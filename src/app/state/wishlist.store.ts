import { Injectable, computed, inject, signal } from '@angular/core';

import type { Product, ProductSummary, WishlistItem } from '@core/models';
import { CartStore } from '@state/cart.store';

const WISHLIST_STORAGE_KEY = 'lumen_wishlist_items';

export interface WishlistToggleResult {
  readonly added: boolean;
  readonly message: string;
}

/**
 * Root state manager for the Wishlist.
 *
 * Manages saved products, toggling wishlist items, checking wishlist status,
 * localStorage persistence, and moving items to the Shopping Cart.
 */
@Injectable({ providedIn: 'root' })
export class WishlistStore {
  private readonly cartStore = inject(CartStore);

  // ---------- Internal State ----------
  private readonly items = signal<readonly WishlistItem[]>([]);

  // ---------- Public Derived State ----------
  readonly wishlistItems = this.items.asReadonly();

  readonly isEmpty = computed(() => this.items().length === 0);

  readonly wishlistCount = computed(() => this.items().length);

  constructor() {
    this.readStoredItems();
  }

  // ---------- Actions & Queries ----------

  /**
   * Checks if a product is saved in the wishlist.
   */
  isWishlisted(productId: string): boolean {
    return this.items().some((item) => item.productId === productId);
  }

  /**
   * Toggles wishlist state for a given product (adds if absent, removes if present).
   */
  toggleWishlist(
    product: ProductSummary | Product,
    brandName?: string,
  ): WishlistToggleResult {
    const productId = product.id;
    if (this.isWishlisted(productId)) {
      this.removeItem(productId);
      return {
        added: false,
        message: `${product.name} removed from your wishlist.`,
      };
    }

    const newItem: WishlistItem = {
      productId: product.id,
      slug: product.slug,
      name: product.name,
      ...(brandName ? { brandName } : {}),
      price: product.price,
      thumbnail: product.thumbnail,
      stockStatus: product.stock.status,
      availableStock: product.stock.available,
      addedAt: new Date().toISOString(),
    };

    const updated = [...this.items(), newItem];
    this.updateState(updated);

    return {
      added: true,
      message: `${product.name} saved to your wishlist.`,
    };
  }

  /**
   * Removes an item from the wishlist.
   */
  removeItem(productId: string): void {
    const updated = this.items().filter((item) => item.productId !== productId);
    this.updateState(updated);
  }

  /**
   * Clears all items from the wishlist.
   */
  clearWishlist(): void {
    this.updateState([]);
  }

  /**
   * Moves a saved wishlist item into the Shopping Cart.
   */
  moveToCart(productId: string): { success: boolean; message: string } {
    const item = this.items().find((i) => i.productId === productId);
    if (!item) {
      return { success: false, message: 'Item not found in wishlist.' };
    }

    // Reconstruct ProductSummary shape for CartStore
    const productStub: ProductSummary = {
      id: item.productId,
      slug: item.slug,
      name: item.name,
      brandId: '',
      categoryId: '',
      summary: '',
      price: item.price,
      thumbnail: item.thumbnail,
      rating: { average: 5, count: 0, distribution: [0, 0, 0, 0, 0] },
      stock: { status: item.stockStatus, available: item.availableStock },
      badges: [],
      createdAt: new Date().toISOString(),
    };

    const cartResult = this.cartStore.addItem(productStub, 1, item.brandName);

    if (cartResult.success) {
      this.removeItem(productId);
      return {
        success: true,
        message: `${item.name} moved to your shopping cart.`,
      };
    }

    return {
      success: false,
      message: cartResult.message,
    };
  }

  // ---------- Internals ----------

  private updateState(newItems: readonly WishlistItem[]): void {
    this.items.set(newItems);
    this.persistItems(newItems);
  }

  private readStoredItems(): void {
    try {
      const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          this.items.set(parsed as WishlistItem[]);
        }
      }
    } catch {
      // Storage restricted
    }
  }

  private persistItems(list: readonly WishlistItem[]): void {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(list));
    } catch {
      // Storage full
    }
  }
}
