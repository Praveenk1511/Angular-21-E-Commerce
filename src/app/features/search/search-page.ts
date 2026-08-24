import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of, tap } from 'rxjs';

import { APP_URLS } from '@core/config/route-paths';
import type { ProductSummary } from '@core/models';
import { CatalogService } from '@core/services/catalog.service';
import { ProductService } from '@core/services/product.service';
import { Breadcrumb } from '@shared/components/breadcrumb/breadcrumb';
import { Button } from '@shared/components/button/button';
import { EmptyState } from '@shared/components/empty-state/empty-state';
import { ErrorState } from '@shared/components/error-state/error-state';
import { PageContainer } from '@shared/components/page-container/page-container';
import { Pagination } from '@shared/components/pagination/pagination';
import { ProductCard } from '@shared/components/product-card/product-card';
import { Skeleton } from '@shared/components/skeleton/skeleton';
import { Spinner } from '@shared/components/spinner/spinner';

/**
 * Full Search Results Page (/search?q=query).
 *
 * Displays full paginated product results for a given query string,
 * brand maps, empty no-results state, and loading/error indicators.
 */
@Component({
  selector: 'app-search-page',
  imports: [
    RouterLink,
    PageContainer,
    Breadcrumb,
    Button,
    ProductCard,
    Pagination,
    Spinner,
    Skeleton,
    ErrorState,
    EmptyState,
  ],
  templateUrl: './search-page.html',
  styleUrl: './search-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchPage {
  /** Query parameter `?q=...` bound via withComponentInputBinding(). */
  readonly q = input<string>();

  private readonly productService = inject(ProductService);
  private readonly catalogService = inject(CatalogService);

  protected readonly productsUrl = APP_URLS.products;

  // ---------- Signals ----------
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly products = signal<readonly ProductSummary[]>([]);
  readonly brandsMap = signal<ReadonlyMap<string, string>>(new Map());
  readonly page = signal(1);
  readonly pageSize = signal(12);
  readonly totalPages = signal(1);
  readonly totalItems = signal(0);

  constructor() {
    effect(() => {
      const queryStr = (this.q() || '').trim();
      this.loadResults(queryStr, 1);
    });
  }

  protected loadResults(queryStr: string, pageNum: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.page.set(pageNum);

    const brands$ =
      this.brandsMap().size > 0
        ? of(this.brandsMap())
        : this.catalogService.getBrands().pipe(
            tap((brands) => {
              const map = new Map<string, string>();
              for (const b of brands) {
                map.set(b.id, b.name);
              }
              this.brandsMap.set(map);
            }),
            catchError(() => of(new Map())),
          );

    const products$ = this.productService.list({
      ...(queryStr ? { q: queryStr } : {}),
      page: pageNum,
      pageSize: this.pageSize(),
    });

    forkJoin({
      brands: brands$,
      productsRes: products$,
    })
      .pipe(
        tap(({ productsRes }) => {
          this.products.set(productsRes.items);
          this.totalItems.set(productsRes.meta.totalItems);
          this.totalPages.set(productsRes.meta.totalPages);
          this.loading.set(false);
        }),
        catchError((err: Error) => {
          this.error.set(err.message || 'Search failed.');
          this.loading.set(false);
          return of(null);
        }),
      )
      .subscribe();
  }

  protected onPageChange(pageNum: number): void {
    this.loadResults((this.q() || '').trim(), pageNum);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
