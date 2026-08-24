import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { APP_URLS } from '@core/config/route-paths';
import type { ProductBadge, ProductSummary } from '@core/models';
import { Badge, type BadgeVariant } from '@shared/components/badge/badge';
import { Icon } from '@shared/components/icon/icon';
import { Rating } from '@shared/components/rating/rating';
import { ToastService } from '@shared/components/toast/toast.service';
import { PricePipe } from '@shared/pipes/price.pipe';
import { WishlistStore } from '@state/wishlist.store';

const BADGE_MAP: Record<ProductBadge, { label: string; variant: BadgeVariant }> = {
  new: { label: 'New', variant: 'brand' },
  sale: { label: 'Sale', variant: 'danger' },
  bestseller: { label: 'Bestseller', variant: 'success' },
  'low-stock': { label: 'Low stock', variant: 'warning' },
};

/**
 * Product card for grid listings: thumbnail, name, brand, price, rating, badges,
 * and interactive wishlist toggle button.
 */
@Component({
  selector: 'app-product-card',
  imports: [RouterLink, Badge, Icon, Rating, PricePipe],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.product-card--list]': "viewMode() === 'list'",
  },
})
export class ProductCard {
  readonly product = input.required<ProductSummary>();
  readonly brandName = input<string>();
  readonly viewMode = input<'grid' | 'list'>('grid');

  private readonly wishlist = inject(WishlistStore);
  private readonly toast = inject(ToastService);

  protected readonly imageFailed = signal(false);

  protected readonly url = computed(() => APP_URLS.productDetail(this.product().slug));

  protected readonly isWishlisted = computed(() =>
    this.wishlist.isWishlisted(this.product().id),
  );

  protected readonly badges = computed(() =>
    this.product().badges.map((badge) => BADGE_MAP[badge]),
  );

  protected readonly hasCompareAt = computed(
    () => this.product().price.compareAtMinor !== undefined,
  );

  protected readonly discountPercent = computed(() => {
    const p = this.product().price;
    if (!p.compareAtMinor || p.compareAtMinor <= p.amountMinor) {
      return null;
    }
    return Math.round(((p.compareAtMinor - p.amountMinor) / p.compareAtMinor) * 100);
  });

  protected readonly isUnavailable = computed(() => {
    const status = this.product().stock.status;

    return status === 'out-of-stock' || status === 'discontinued';
  });

  protected handleImageError(): void {
    this.imageFailed.set(true);
  }

  protected toggleWishlist(event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    const res = this.wishlist.toggleWishlist(this.product(), this.brandName());
    if (res.added) {
      this.toast.success('Saved to Wishlist', res.message);
    } else {
      this.toast.show({
        variant: 'info',
        title: 'Wishlist Updated',
        message: res.message,
      });
    }
  }
}
