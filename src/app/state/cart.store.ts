import { Injectable, computed, signal } from '@angular/core';

import type { CartItem, Product, ProductSummary } from '@core/models';

const CART_STORAGE_KEY = 'lumen_cart_items';
const FREE_SHIPPING_THRESHOLD_MINOR = 5000; // £50.00
const STANDARD_SHIPPING_FEE_MINOR = 499; // £4.99

export interface AddToCartResult {
  readonly success: boolean;
  readonly message: string;
  readonly addedQty: number;
}

/**
 * Root state manager for the Shopping Cart.
 *
 * Manages cart line items, quantity adjustments, stock validation limits,
 * localStorage persistence, and derived monetary calculations (subtotal, shipping, tax, total).
 */
@Injectable({ providedIn: 'root' })
export class CartStore {
  // ---------- Internal State ----------
  private readonly items = signal<readonly CartItem[]>([]);

  // ---------- Public Derived State ----------
  readonly cartItems = this.items.asReadonly();

  readonly isEmpty = computed(() => this.items().length === 0);

  /** Total number of items (sum of quantities across all line items). */
  readonly itemCount = computed(() =>
    this.items().reduce((sum, item) => sum + item.quantity, 0),
  );

  /** Number of distinct product entries in cart. */
  readonly lineItemCount = computed(() => this.items().length);

  /** Subtotal amount in minor units (pence/cents). */
  readonly subtotalMinor = computed(() =>
    this.items().reduce((acc, item) => acc + item.price.amountMinor * item.quantity, 0),
  );

  /** Total compare-at price savings in minor units. */
  readonly discountMinor = computed(() =>
    this.items().reduce((acc, item) => {
      const compareAt = item.price.compareAtMinor;
      if (compareAt && compareAt > item.price.amountMinor) {
        return acc + (compareAt - item.price.amountMinor) * item.quantity;
      }
      return acc;
    }, 0),
  );

  /** Shipping fee in minor units (£0 if subtotal >= £50 or cart empty, else £4.99). */
  readonly shippingMinor = computed(() => {
    const subtotal = this.subtotalMinor();
    if (subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD_MINOR) {
      return 0;
    }
    return STANDARD_SHIPPING_FEE_MINOR;
  });

  /** Remaining amount in minor units to qualify for free shipping. */
  readonly freeShippingRemainingMinor = computed(() => {
    const subtotal = this.subtotalMinor();
    if (subtotal >= FREE_SHIPPING_THRESHOLD_MINOR) {
      return 0;
    }
    return FREE_SHIPPING_THRESHOLD_MINOR - subtotal;
  });

  /** Estimated tax (20% VAT included). */
  readonly taxMinor = computed(() => Math.round(this.subtotalMinor() * 0.2));

  /** Grand total in minor units (subtotal + shipping). */
  readonly totalMinor = computed(() => this.subtotalMinor() + this.shippingMinor());

  constructor() {
    this.readStoredItems();
  }

  // ---------- Actions ----------

  /**
   * Adds a product to the cart with stock validation.
   */
  addItem(
    product: ProductSummary | Product,
    requestedQty: number = 1,
    brandName?: string,
  ): AddToCartResult {
    const available = product.stock.available;
    const isPurchasable =
      product.stock.status === 'in-stock' ||
      product.stock.status === 'low-stock' ||
      product.stock.status === 'preorder';

    if (!isPurchasable || available <= 0) {
      return {
        success: false,
        message: `${product.name} is currently out of stock.`,
        addedQty: 0,
      };
    }

    const currentItems = [...this.items()];
    const existingIndex = currentItems.findIndex((item) => item.productId === product.id);

    if (existingIndex !== -1) {
      const existing = currentItems[existingIndex]!;
      const newQty = existing.quantity + requestedQty;

      if (newQty > available) {
        const allowedToAdd = Math.max(0, available - existing.quantity);
        if (allowedToAdd === 0) {
          return {
            success: false,
            message: `Cannot add more. Maximum available stock (${available}) is already in your cart.`,
            addedQty: 0,
          };
        }

        currentItems[existingIndex] = {
          ...existing,
          quantity: available,
        };
        this.updateState(currentItems);

        return {
          success: true,
          message: `Added ${allowedToAdd} item(s). Cart quantity updated to maximum stock available (${available}).`,
          addedQty: allowedToAdd,
        };
      }

      currentItems[existingIndex] = {
        ...existing,
        quantity: newQty,
      };
      this.updateState(currentItems);

      return {
        success: true,
        message: `Updated ${product.name} quantity to ${newQty}.`,
        addedQty: requestedQty,
      };
    }

    const validInitialQty = Math.min(requestedQty, available);
    const newItem: CartItem = {
      productId: product.id,
      slug: product.slug,
      name: product.name,
      ...(brandName ? { brandName } : {}),
      price: product.price,
      thumbnail: product.thumbnail,
      quantity: validInitialQty,
      availableStock: available,
      stockStatus: product.stock.status,
    };

    this.updateState([...currentItems, newItem]);

    return {
      success: true,
      message: `Added ${validInitialQty} × ${product.name} to your cart.`,
      addedQty: validInitialQty,
    };
  }

  /**
   * Removes a product completely from the cart.
   */
  removeItem(productId: string): void {
    const updated = this.items().filter((item) => item.productId !== productId);
    this.updateState(updated);
  }

  /**
   * Directly sets the quantity of a cart item with stock clamping.
   */
  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }

    const currentItems = [...this.items()];
    const index = currentItems.findIndex((item) => item.productId === productId);

    if (index === -1) {
      return;
    }

    const item = currentItems[index]!;
    const clampedQty = Math.min(quantity, item.availableStock);

    currentItems[index] = {
      ...item,
      quantity: clampedQty,
    };

    this.updateState(currentItems);
  }

  /**
   * Increments quantity of a cart item by 1 up to available stock.
   */
  incrementQuantity(productId: string): void {
    const item = this.items().find((i) => i.productId === productId);
    if (item) {
      this.updateQuantity(productId, item.quantity + 1);
    }
  }

  /**
   * Decrements quantity of a cart item by 1 (removes if quantity reaches 0).
   */
  decrementQuantity(productId: string): void {
    const item = this.items().find((i) => i.productId === productId);
    if (item) {
      this.updateQuantity(productId, item.quantity - 1);
    }
  }

  /**
   * Clears all items from the cart.
   */
  clearCart(): void {
    this.updateState([]);
  }

  // ---------- Internals ----------

  private updateState(newItems: readonly CartItem[]): void {
    this.items.set(newItems);
    this.persistItems(newItems);
  }

  private readStoredItems(): void {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          this.items.set(parsed as CartItem[]);
        }
      }
    } catch {
      // Storage unavailable
    }
  }

  private persistItems(list: readonly CartItem[]): void {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(list));
    } catch {
      // Storage full or restricted
    }
  }
}
