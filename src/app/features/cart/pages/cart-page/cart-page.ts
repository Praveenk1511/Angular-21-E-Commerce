import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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
  private readonly toast = inject(ToastService);

  protected readonly productsUrl = APP_URLS.products;
  protected readonly checkoutUrl = APP_URLS.checkout;

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
