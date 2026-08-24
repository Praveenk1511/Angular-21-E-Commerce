import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, forkJoin, of, tap } from 'rxjs';

import type { ApiRequestError, Brand, Product, ProductSummary } from '@core/models';
import { CatalogService } from '@core/services/catalog.service';
import { ProductService } from '@core/services/product.service';

/**
 * State orchestrator for the Product Detail view (/products/:id).
 *
 * Manages fetching single product details, resolving brand information,
 * handling related products, image gallery selection, variant selection,
 * quantity state, loading, and 404/error states.
 */
@Injectable()
export class ProductDetailStore {
  private readonly productService = inject(ProductService);
  private readonly catalogService = inject(CatalogService);

  // ---------- Internal Signals ----------
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly notFound = signal(false);

  readonly product = signal<Product | null>(null);
  readonly brand = signal<Brand | null>(null);
  readonly relatedProducts = signal<readonly ProductSummary[]>([]);

  readonly selectedImageIndex = signal(0);
  readonly quantity = signal(1);
  readonly selectedVariant = signal<string | null>(null);

  // ---------- Derived Signals ----------
  readonly currentImage = computed(() => {
    const prod = this.product();
    if (!prod || !prod.images || prod.images.length === 0) {
      return prod?.thumbnail ?? null;
    }
    const idx = this.selectedImageIndex();
    return prod.images[idx] ?? prod.images[0] ?? prod.thumbnail;
  });

  readonly discountPercent = computed(() => {
    const prod = this.product();
    if (!prod) {
      return null;
    }
    const compareAt = prod.price.compareAtMinor;
    const amount = prod.price.amountMinor;
    if (!compareAt || compareAt <= amount) {
      return null;
    }
    return Math.round(((compareAt - amount) / compareAt) * 100);
  });

  readonly isAvailable = computed(() => {
    const status = this.product()?.stock.status;
    return status === 'in-stock' || status === 'low-stock' || status === 'preorder';
  });

  // ---------- Actions ----------

  /**
   * Loads product details by ID or slug along with brand and related products.
   */
  loadProduct(idOrSlug: string): void {
    if (!idOrSlug) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.notFound.set(false);
    this.selectedImageIndex.set(0);
    this.quantity.set(1);
    this.selectedVariant.set(null);

    this.productService
      .getByIdOrSlug(idOrSlug)
      .pipe(
        tap((product) => {
          this.product.set(product);
          this.loadAuxiliaryData(product);
        }),
        catchError((err: ApiRequestError | Error) => {
          this.loading.set(false);
          if ('status' in err && err.status === 404) {
            this.notFound.set(true);
          } else {
            this.error.set(err.message || 'Failed to load product details.');
          }
          return of(null);
        }),
      )
      .subscribe();
  }

  selectImage(index: number): void {
    this.selectedImageIndex.set(index);
  }

  setQuantity(qty: number): void {
    const maxQty = this.product()?.stock.available ?? 99;
    const clamped = Math.max(1, Math.min(qty, maxQty > 0 ? maxQty : 1));
    this.quantity.set(clamped);
  }

  selectVariant(variant: string): void {
    this.selectedVariant.set(variant);
  }

  // ---------- Private Helpers ----------

  private loadAuxiliaryData(product: Product): void {
    const brand$ = product.brandId
      ? this.catalogService.getBrand(product.brandId).pipe(catchError(() => of(null)))
      : of(null);

    const related$ = this.productService
      .getRelated(product.slug || product.id)
      .pipe(catchError(() => of([])));

    forkJoin({
      brand: brand$,
      related: related$,
    })
      .pipe(
        tap(({ brand, related }) => {
          this.brand.set(brand);
          this.relatedProducts.set(related);
          this.loading.set(false);
        }),
        catchError(() => {
          this.loading.set(false);
          return of(null);
        }),
      )
      .subscribe();
  }
}
