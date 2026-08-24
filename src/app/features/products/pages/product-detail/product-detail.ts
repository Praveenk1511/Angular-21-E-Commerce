import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { APP_URLS } from '@core/config/route-paths';
import { Badge } from '@shared/components/badge/badge';
import { Breadcrumb } from '@shared/components/breadcrumb/breadcrumb';
import { Button } from '@shared/components/button/button';
import { EmptyState } from '@shared/components/empty-state/empty-state';
import { ErrorState } from '@shared/components/error-state/error-state';
import { Icon } from '@shared/components/icon/icon';
import { PageContainer } from '@shared/components/page-container/page-container';
import { ProductCard } from '@shared/components/product-card/product-card';
import { ProductReviews } from '@shared/components/product-reviews/product-reviews';
import { QuantitySelector } from '@shared/components/quantity-selector/quantity-selector';
import { Rating } from '@shared/components/rating/rating';
import { Skeleton } from '@shared/components/skeleton/skeleton';
import { Spinner } from '@shared/components/spinner/spinner';
import { ToastService } from '@shared/components/toast/toast.service';
import { PricePipe } from '@shared/pipes/price.pipe';
import { ProductDetailStore } from '@state/product-detail.store';
import { CartStore } from '@state/cart.store';
import { WishlistStore } from '@state/wishlist.store';

/**
 * Product Details Page (/products/:id).
 *
 * Renders full product information, gallery preview, SKU, stock status, ratings,
 * specifications grid, quantity selector, placeholder Add to Cart button, and
 * related products grid.
 */
@Component({
  selector: 'app-product-detail',
  imports: [
    RouterLink,
    PageContainer,
    Breadcrumb,
    Badge,
    Button,
    Icon,
    Rating,
    QuantitySelector,
    ProductCard,
    ProductReviews,
    Spinner,
    Skeleton,
    ErrorState,
    EmptyState,
    PricePipe,
  ],
  providers: [ProductDetailStore],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetail {
  /** Bound from the `:id` route parameter by `withComponentInputBinding()`. */
  readonly id = input.required<string>();

  protected readonly store = inject(ProductDetailStore);
  private readonly cartStore = inject(CartStore);
  protected readonly wishlistStore = inject(WishlistStore);
  private readonly toast = inject(ToastService);
  protected readonly productsUrl = APP_URLS.products;

  protected readonly isWishlisted = computed(() => {
    const prod = this.store.product();
    return prod ? this.wishlistStore.isWishlisted(prod.id) : false;
  });

  constructor() {
    effect(() => {
      const productId = this.id();
      if (productId) {
        this.store.loadProduct(productId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  protected handleAddToCart(): void {
    const prod = this.store.product();
    if (!prod) {
      return;
    }
    const qty = this.store.quantity();
    const brandName = this.store.brand()?.name;
    const result = this.cartStore.addItem(prod, qty, brandName);

    if (result.success) {
      this.toast.success('Added to Cart', result.message);
    } else {
      this.toast.error('Cannot Add Item', result.message);
    }
  }

  protected handleAddToWishlist(): void {
    const prod = this.store.product();
    if (!prod) {
      return;
    }
    const brandName = this.store.brand()?.name;
    const result = this.wishlistStore.toggleWishlist(prod, brandName);

    if (result.added) {
      this.toast.success('Saved to Wishlist', result.message);
    } else {
      this.toast.show({
        variant: 'info',
        title: 'Wishlist Updated',
        message: result.message,
      });
    }
  }
}
