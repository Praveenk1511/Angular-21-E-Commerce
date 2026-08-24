import { Injectable, inject, signal } from '@angular/core';
import { catchError, forkJoin, of, switchMap, tap } from 'rxjs';

import type {
  ApiRequestError,
  Category,
  CategoryTreeNode,
  ProductFacets,
  ProductSummary,
} from '@core/models';
import { CatalogService } from '@core/services/catalog.service';
import { ProductService } from '@core/services/product.service';

/**
 * State orchestrator for Category views (/categories overview and /category/:slug products view).
 *
 * Handles category trees, subcategory hierarchies, category hero metadata, product counts,
 * paginated category product grids, brand lookups, and facets (prepared for future filtering).
 */
@Injectable()
export class CategoryStore {
  private readonly catalogService = inject(CatalogService);
  private readonly productService = inject(ProductService);

  // ---------- Signals ----------
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly notFound = signal(false);

  readonly categoryTree = signal<readonly CategoryTreeNode[]>([]);
  readonly flatCategories = signal<readonly Category[]>([]);
  readonly currentCategory = signal<Category | null>(null);
  readonly parentCategory = signal<Category | null>(null);
  readonly subcategories = signal<readonly Category[]>([]);

  readonly products = signal<readonly ProductSummary[]>([]);
  readonly brandsMap = signal<ReadonlyMap<string, string>>(new Map());
  readonly facets = signal<ProductFacets | null>(null);

  readonly page = signal(1);
  readonly pageSize = signal(12);
  readonly totalPages = signal(1);
  readonly totalItems = signal(0);

  // ---------- Actions ----------

  /**
   * Loads the category tree overview for /categories page.
   */
  loadCategoriesOverview(): void {
    this.loading.set(true);
    this.error.set(null);

    this.catalogService
      .getCategoryTree()
      .pipe(
        tap((tree) => {
          this.categoryTree.set(tree);
          this.loading.set(false);
        }),
        catchError((err: Error) => {
          this.error.set(err.message || 'Failed to load category catalog.');
          this.loading.set(false);
          return of(null);
        }),
      )
      .subscribe();
  }

  /**
   * Loads category details, subcategories, parent category, and category products for /category/:slug.
   */
  loadCategoryBySlug(slug: string, page: number = this.page()): void {
    if (!slug) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.notFound.set(false);
    this.page.set(page);

    const brands$ =
      this.brandsMap().size > 0
        ? of(this.brandsMap())
        : this.catalogService.getBrands().pipe(
            tap((brands) => {
              const map = new Map<string, string>();
              for (const brand of brands) {
                map.set(brand.id, brand.name);
              }
              this.brandsMap.set(map);
            }),
            catchError(() => of(new Map())),
          );

    const categories$ =
      this.flatCategories().length > 0
        ? of(this.flatCategories())
        : this.catalogService.getCategoriesFlat().pipe(
            tap((cats) => this.flatCategories.set(cats)),
            catchError(() => of([])),
          );

    categories$
      .pipe(
        switchMap((flat) => {
          const current = flat.find((c) => c.slug === slug);
          if (!current) {
            this.notFound.set(true);
            this.loading.set(false);
            return of(null);
          }

          this.currentCategory.set(current);
          const parent = current.parentId
            ? (flat.find((c) => c.id === current.parentId) ?? null)
            : null;
          this.parentCategory.set(parent);

          const subs = flat.filter((c) => c.parentId === current.id);
          this.subcategories.set(subs);

          return forkJoin({
            brands: brands$,
            productsRes: this.productService.list({
              categoryId: current.id,
              page,
              pageSize: this.pageSize(),
            }),
          });
        }),
        tap((res) => {
          if (!res) {
            return;
          }
          const { productsRes } = res;
          this.products.set(productsRes.items);
          this.totalItems.set(productsRes.meta.totalItems);
          this.totalPages.set(productsRes.meta.totalPages);
          this.facets.set(productsRes.facets);
          this.loading.set(false);
        }),
        catchError((err: ApiRequestError | Error) => {
          this.loading.set(false);
          if ('status' in err && err.status === 404) {
            this.notFound.set(true);
          } else {
            this.error.set(err.message || 'Failed to load category products.');
          }
          return of(null);
        }),
      )
      .subscribe();
  }

  /**
   * Updates pagination for category products.
   */
  setPage(page: number): void {
    const current = this.currentCategory();
    if (!current || page < 1 || page > this.totalPages() || page === this.page()) {
      return;
    }
    this.loadCategoryBySlug(current.slug, page);
  }
}
