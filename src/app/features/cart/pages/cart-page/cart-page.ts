import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { APP_URLS } from '@core/config/route-paths';
import { Badge } from '@shared/components/badge/badge';
import { Button } from '@shared/components/button/button';
import { EmptyState } from '@shared/components/empty-state/empty-state';
import { Icon } from '@shared/components/icon/icon';
import { PageContainer } from '@shared/components/page-container/page-container';
import { QuantitySelector } from '@shared/components/quantity-selector/quantity-selector';
import { ToastService } from '@shared/components/toast/toast.service';
import { PricePipe } from '@shared/pipes/price.pipe';
import { CartStore } from '@state/cart.store';
import { CouponStore } from '@state/coupon.store';

/**
 * Shopping Cart Page (/cart).
 *
 * Renders list of cart line items with thumbnails, quantity selectors, stock statuses,
 * remove actions, order breakdown summary (subtotal, shipping, discount, tax, total),
 * free shipping progress bar, checkout CTA button, and empty state.
 */
@Component({
  selector: 'app-cart-page',
  imports: [
    RouterLink,
    PageContainer,
    Button,
    Icon,
    Badge,
    QuantitySelector,
    EmptyState,
    PricePipe,
  ],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartPage {
  protected readonly cart = inject(CartStore);
  protected readonly couponStore = inject(CouponStore);
  private readonly toast = inject(ToastService);

  protected readonly productsUrl = APP_URLS.products;
  protected readonly checkoutUrl = APP_URLS.checkout;

  protected couponInput = signal<string>('');

  protected readonly couponDiscountMinor = computed(() => {
    const applied = this.couponStore.appliedCoupon();
    if (!applied) return 0;
    const res = this.couponStore.validateCoupon(applied.code, this.cart.subtotalMinor());
    return res.valid ? res.discountMinor : 0;
  });

  protected readonly grandTotalWithCoupon = computed(() => {
    const total = this.cart.totalMinor();
    const discount = this.couponDiscountMinor();
    return Math.max(0, total - discount);
  });

  protected applyCouponCode(): void {
    const code = this.couponInput().trim();
    if (!code) {
      this.toast.error('Promo Code Required', 'Please enter a valid coupon code.');
      return;
    }

    const res = this.couponStore.applyCoupon(code, this.cart.subtotalMinor());
    if (res.valid) {
      this.toast.success('Coupon Applied', res.message);
      this.couponInput.set('');
    } else {
      this.toast.error('Coupon Validation Error', res.message);
    }
  }

  protected removeAppliedCoupon(): void {
    this.couponStore.removeCoupon();
    this.toast.show({ variant: 'info', title: 'Coupon Removed', message: 'Promo code removed from your order.' });
  }

  protected getItemUrl(slug: string): string {
    return APP_URLS.productDetail(slug);
  }

  protected onQuantityChange(productId: string, newQty: number): void {
    const currentItem = this.cart.cartItems().find((i) => i.productId === productId);
    if (!currentItem) {
      return;
    }

    if (newQty > currentItem.availableStock) {
      this.toast.error(
        'Stock Limit Reached',
        `Only ${currentItem.availableStock} units of ${currentItem.name} are available in stock.`,
      );
      this.cart.updateQuantity(productId, currentItem.availableStock);
      return;
    }

    this.cart.updateQuantity(productId, newQty);
  }

  protected removeItem(productId: string, name: string): void {
    this.cart.removeItem(productId);
    this.toast.show({ variant: 'info', title: 'Item Removed', message: `${name} removed from your cart.` });
  }

  protected clearAll(): void {
    this.cart.clearCart();
    this.toast.show({ variant: 'info', title: 'Cart Cleared', message: 'All items have been removed from your cart.' });
  }
}
