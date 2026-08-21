import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { APP_URLS } from '@core/config/route-paths';
import type { ProductBadge, ProductSummary } from '@core/models';
import { Badge, type BadgeVariant } from '@shared/components/badge/badge';
import { Rating } from '@shared/components/rating/rating';
import { PricePipe } from '@shared/pipes/price.pipe';

const BADGE_MAP: Record<ProductBadge, { label: string; variant: BadgeVariant }> = {
  new: { label: 'New', variant: 'brand' },
  sale: { label: 'Sale', variant: 'danger' },
  bestseller: { label: 'Bestseller', variant: 'success' },
  'low-stock': { label: 'Low stock', variant: 'warning' },
};

/**
 * Product card for grid listings: thumbnail, name, brand placeholder, price, rating
 * and badges.
 *
 * Entirely presentational — it takes a `ProductSummary` as input and renders it. No
 * service calls, no state. Reused by the home page, catalog grid, search results, and
 * anything else that shows a list of products.
 *
 * The whole card is linked via a stretched anchor on the product name, so the entire
 * surface is clickable without wrapping a `div` in an `<a>` (which is invalid HTML for
 * interactive content).
 */
@Component({
  selector: 'app-product-card',
  imports: [RouterLink, Badge, Rating, PricePipe],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCard {
  readonly product = input.required<ProductSummary>();

  protected readonly url = computed(() => APP_URLS.productDetail(this.product().slug));

  protected readonly badges = computed(() =>
    this.product().badges.map((badge) => BADGE_MAP[badge]),
  );

  protected readonly hasCompareAt = computed(
    () => this.product().price.compareAtMinor !== undefined,
  );

  protected readonly isUnavailable = computed(() => {
    const status = this.product().stock.status;

    return status === 'out-of-stock' || status === 'discontinued';
  });
}
