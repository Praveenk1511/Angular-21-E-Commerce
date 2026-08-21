import { Injectable, inject, signal } from '@angular/core';
import { catchError, forkJoin, of, tap } from 'rxjs';

import type { CategoryTreeNode, ProductSummary } from '@core/models';
import { CatalogService } from '@core/services/catalog.service';
import { ProductService } from '@core/services/product.service';

/**
 * Data orchestrator for the home page.
 *
 * Fetches every section's data in parallel on initialisation, so the page does not
 * waterfall through sequential requests. Each section's data is held as a signal;
 * consumers read them and render skeletons until they arrive.
 *
 * No caching across navigations — the home page is lightweight enough that refetching
 * on each visit keeps the content fresh without a staleness strategy.
 */
@Injectable()
export class HomeStore {
  private readonly products = inject(ProductService);
  private readonly catalog = inject(CatalogService);

  // ---------- Signals ----------
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly featuredProducts = signal<readonly ProductSummary[]>([]);
  readonly bestSellers = signal<readonly ProductSummary[]>([]);
  readonly newArrivals = signal<readonly ProductSummary[]>([]);
  readonly deals = signal<readonly ProductSummary[]>([]);
  readonly categories = signal<readonly CategoryTreeNode[]>([]);

  // ---------- Commands ----------

  /**
   * Kicks off all data fetching. Called once when the home component initialises.
   */
  load(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      featured: this.products.list({ sort: 'relevance', pageSize: 8, inStockOnly: true }),
      best: this.products.list({ sort: 'rating', direction: 'desc', pageSize: 4, minRating: 4 }),
      newest: this.products.list({ sort: 'newest', pageSize: 8 }),
      onSale: this.products.list({
        sort: 'relevance',
        pageSize: 4,
        minPriceMinor: 1,
        maxPriceMinor: 999999,
      }),
      cats: this.catalog.getCategoryTree(),
    })
      .pipe(
        tap(({ featured, best, newest, onSale, cats }) => {
          this.featuredProducts.set(featured.items);
          this.bestSellers.set(best.items);
          this.newArrivals.set(newest.items);

          // Filter to items that actually have a compareAtMinor (i.e. are on sale).
          const saleItems = onSale.items.filter((item) => item.price.compareAtMinor !== undefined);
          this.deals.set(saleItems.length > 0 ? saleItems : onSale.items.slice(0, 4));

          this.categories.set(cats);
          this.loading.set(false);
        }),
        catchError((err: Error) => {
          this.error.set(err.message);
          this.loading.set(false);

          return of(null);
        }),
      )
      .subscribe();
  }
}
