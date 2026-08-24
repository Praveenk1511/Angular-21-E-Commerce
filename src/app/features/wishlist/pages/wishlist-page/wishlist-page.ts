import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { APP_URLS } from '@core/config/route-paths';
import { Badge } from '@shared/components/badge/badge';
import { Button } from '@shared/components/button/button';
import { EmptyState } from '@shared/components/empty-state/empty-state';
import { Icon } from '@shared/components/icon/icon';
import { PageContainer } from '@shared/components/page-container/page-container';
import { ToastService } from '@shared/components/toast/toast.service';
import { PricePipe } from '@shared/pipes/price.pipe';
import { WishlistStore } from '@state/wishlist.store';

/**
 * Saved Wishlist Page (/wishlist).
 *
 * Renders user's saved wishlist products grid, product details, stock statuses,
 * "Move to Cart" action, item removal, and empty state CTA.
 */
@Component({
  selector: 'app-wishlist-page',
  imports: [
    RouterLink,
    PageContainer,
    Button,
    Icon,
    Badge,
    EmptyState,
    PricePipe,
  ],
  templateUrl: './wishlist-page.html',
  styleUrl: './wishlist-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WishlistPage {
  protected readonly wishlist = inject(WishlistStore);
  private readonly toast = inject(ToastService);

  protected readonly productsUrl = APP_URLS.products;

  protected getItemUrl(slug: string): string {
    return APP_URLS.productDetail(slug);
  }

  protected moveToCart(productId: string): void {
    const res = this.wishlist.moveToCart(productId);
    if (res.success) {
      this.toast.success('Moved to Cart', res.message);
    } else {
      this.toast.error('Cannot Move Item', res.message);
    }
  }

  protected removeItem(productId: string, name: string): void {
    this.wishlist.removeItem(productId);
    this.toast.show({
      variant: 'info',
      title: 'Item Removed',
      message: `${name} removed from your wishlist.`,
    });
  }

  protected clearAll(): void {
    this.wishlist.clearWishlist();
    this.toast.show({
      variant: 'info',
      title: 'Wishlist Cleared',
      message: 'All items removed from your wishlist.',
    });
  }
}
