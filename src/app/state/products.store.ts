import { Injectable, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { catchError, forkJoin, of, tap } from 'rxjs';

import type {
  CategoryTreeNode,
  ProductFacets,
  ProductListQuery,
  ProductSortField,
  ProductSummary,
  SortDirection,
} from '@core/models';
import { CatalogService } from '@core/services/catalog.service';
import { ProductService } from '@core/services/product.service';

/**
 * State orchestrator for the Product Catalog listing (/products).
 *
 * Manages paginated product lists, filter criteria, facets, sorting, layout view mode,
 * loading, error states, and URL query parameter synchronization.
 */
@Injectable()
export class ProductsStore {
  private readonly productService = inject(ProductService);
  private readonly catalogService = inject(CatalogService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // ---------- Signals ----------
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly products = signal<readonly ProductSummary[]>([]);
  readonly totalItems = signal(0);
  readonly page = signal(1);
  readonly pageSize = signal(12);
  readonly totalPages = signal(1);

  readonly categoryTree = signal<readonly CategoryTreeNode[]>([]);
  readonly facets = signal<ProductFacets | null>(null);
  readonly brandsMap = signal<ReadonlyMap<string, string>>(new Map());

  // ---------- Filter Signals ----------
  readonly selectedCategory = signal<string | null>(null);
  readonly selectedBrands = signal<readonly string[]>([]);
  readonly minPrice = signal<number | null>(null);
  readonly maxPrice = signal<number | null>(null);
  readonly minRating = signal<number | null>(null);
  readonly inStockOnly = signal<boolean>(false);
  readonly onSaleOnly = signal<boolean>(false);
  readonly sort = signal<string>('relevance');
  readonly viewMode = signal<'grid' | 'list'>('grid');

  readonly activeFilterCount = computed(() => {
    let count = 0;
    if (this.selectedCategory()) {
      count++;
    }
    count += this.selectedBrands().length;
    if (this.minPrice() !== null || this.maxPrice() !== null) {
      count++;
    }
    if (this.minRating() !== null) {
      count++;
    }
    if (this.inStockOnly()) {
      count++;
    }
    if (this.onSaleOnly()) {
      count++;
    }
    return count;
  });

  // ---------- Actions ----------

  /**
   * Initializes store state from URL query params or triggers standard load.
   */
  initFromUrl(): void {
    this.route.queryParams.subscribe((params) => {
      this.applyQueryParams(params);
      this.fetchData();
    });
  }

  load(page: number = this.page()): void {
    this.page.set(page);
    this.syncUrl();
  }

  setCategory(catId: string | null): void {
    this.selectedCategory.set(catId);
    this.page.set(1);
    this.syncUrl();
  }

  setBrands(brandIds: readonly string[]): void {
    this.selectedBrands.set(brandIds);
    this.page.set(1);
    this.syncUrl();
  }

  setPriceRange(min: number | null, max: number | null): void {
    this.minPrice.set(min);
    this.maxPrice.set(max);
    this.page.set(1);
    this.syncUrl();
  }

  setRating(minRating: number | null): void {
    this.minRating.set(minRating);
    this.page.set(1);
    this.syncUrl();
  }

  setInStockOnly(value: boolean): void {
    this.inStockOnly.set(value);
    this.page.set(1);
    this.syncUrl();
  }

  setOnSaleOnly(value: boolean): void {
    this.onSaleOnly.set(value);
    this.page.set(1);
    this.syncUrl();
  }

  setSort(sortKey: string): void {
    this.sort.set(sortKey);
    this.page.set(1);
    this.syncUrl();
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode.set(mode);
  }

  setPage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.page()) {
      return;
    }
    this.page.set(page);
    this.syncUrl();
  }

  resetFilters(): void {
    this.selectedCategory.set(null);
    this.selectedBrands.set([]);
    this.minPrice.set(null);
    this.maxPrice.set(null);
    this.minRating.set(null);
    this.inStockOnly.set(false);
    this.onSaleOnly.set(false);
    this.sort.set('relevance');
    this.page.set(1);
    this.syncUrl();
  }

  // ---------- Private Helpers ----------

  private applyQueryParams(params: Params): void {
    this.selectedCategory.set(params['category'] || params['categoryId'] || null);

    const rawBrand = params['brand'] || params['brandIds'];
    if (typeof rawBrand === 'string' && rawBrand.trim()) {
      this.selectedBrands.set(rawBrand.split(',').map((b) => b.trim()));
    } else if (Array.isArray(rawBrand)) {
      this.selectedBrands.set(rawBrand as string[]);
    } else {
      this.selectedBrands.set([]);
    }

    const minP = params['minPrice'] || params['minPriceMinor'];
    this.minPrice.set(minP !== undefined && !isNaN(Number(minP)) ? Number(minP) : null);

    const maxP = params['maxPrice'] || params['maxPriceMinor'];
    this.maxPrice.set(maxP !== undefined && !isNaN(Number(maxP)) ? Number(maxP) : null);

    const rating = params['rating'] || params['minRating'];
    this.minRating.set(rating !== undefined && !isNaN(Number(rating)) ? Number(rating) : null);

    this.inStockOnly.set(params['inStock'] === 'true' || params['inStockOnly'] === 'true');
    this.onSaleOnly.set(params['onSale'] === 'true' || params['onSaleOnly'] === 'true');

    this.sort.set(params['sort'] || 'relevance');

    const pg = Number(params['page']);
    this.page.set(!isNaN(pg) && pg > 0 ? pg : 1);
  }

  private syncUrl(): void {
    const queryParams: Record<string, string | number | boolean | null> = {};

    if (this.selectedCategory()) {
      queryParams['category'] = this.selectedCategory();
    }
    if (this.selectedBrands().length > 0) {
      queryParams['brand'] = this.selectedBrands().join(',');
    }
    if (this.minPrice() !== null) {
      queryParams['minPrice'] = this.minPrice();
    }
    if (this.maxPrice() !== null) {
      queryParams['maxPrice'] = this.maxPrice();
    }
    if (this.minRating() !== null) {
      queryParams['rating'] = this.minRating();
    }
    if (this.inStockOnly()) {
      queryParams['inStock'] = true;
    }
    if (this.onSaleOnly()) {
      queryParams['onSale'] = true;
    }
    if (this.sort() !== 'relevance') {
      queryParams['sort'] = this.sort();
    }
    if (this.page() > 1) {
      queryParams['page'] = this.page();
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
    });
  }

  private fetchData(): void {
    this.loading.set(true);
    this.error.set(null);

    const brands$ =
      this.brandsMap().size > 0
        ? of(null)
        : this.catalogService.getBrands().pipe(
            tap((brands) => {
              const map = new Map<string, string>();
              for (const b of brands) {
                map.set(b.id, b.name);
              }
              this.brandsMap.set(map);
            }),
            catchError(() => of(null)),
          );

    const tree$ =
      this.categoryTree().length > 0
        ? of(null)
        : this.catalogService.getCategoryTree().pipe(
            tap((tree) => this.categoryTree.set(tree)),
            catchError(() => of(null)),
          );

    const { sortField, sortDirection } = parseSortParam(this.sort());

    const query: ProductListQuery = {
      page: this.page(),
      pageSize: this.pageSize(),
      ...(this.selectedCategory() ? { categoryId: this.selectedCategory()! } : {}),
      ...(this.selectedBrands().length > 0 ? { brandIds: this.selectedBrands() } : {}),
      ...(this.minPrice() !== null ? { minPriceMinor: Math.round(this.minPrice()! * 100) } : {}),
      ...(this.maxPrice() !== null ? { maxPriceMinor: Math.round(this.maxPrice()! * 100) } : {}),
      ...(this.minRating() !== null ? { minRating: this.minRating()! } : {}),
      ...(this.inStockOnly() ? { inStockOnly: true } : {}),
      ...(this.onSaleOnly() ? { onSaleOnly: true } : {}),
      sort: sortField,
      ...(sortDirection ? { direction: sortDirection } : {}),
    };

    const products$ = this.productService.list(query);

    forkJoin({
      brands: brands$,
      tree: tree$,
      productsResult: products$,
    })
      .pipe(
        tap(({ productsResult }) => {
          this.products.set(productsResult.items);
          this.totalItems.set(productsResult.meta.totalItems);
          this.totalPages.set(productsResult.meta.totalPages);
          this.facets.set(productsResult.facets);
          this.loading.set(false);
        }),
        catchError((err: Error) => {
          this.error.set(err.message || 'Failed to load product catalog.');
          this.loading.set(false);
          return of(null);
        }),
      )
      .subscribe();
  }
}

function parseSortParam(param: string): {
  sortField: ProductSortField;
  sortDirection?: SortDirection;
} {
  switch (param) {
    case 'price_asc':
      return { sortField: 'price', sortDirection: 'asc' };
    case 'price_desc':
      return { sortField: 'price', sortDirection: 'desc' };
    case 'rating':
      return { sortField: 'rating', sortDirection: 'desc' };
    case 'newest':
      return { sortField: 'newest', sortDirection: 'desc' };
    case 'relevance':
    default:
      return { sortField: 'relevance' };
  }
}
