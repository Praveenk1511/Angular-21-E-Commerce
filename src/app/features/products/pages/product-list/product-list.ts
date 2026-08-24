import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { Drawer } from '@shared/components/drawer/drawer';
import { EmptyState } from '@shared/components/empty-state/empty-state';
import { ErrorState } from '@shared/components/error-state/error-state';
import { PageContainer } from '@shared/components/page-container/page-container';
import { Pagination } from '@shared/components/pagination/pagination';
import { ProductCard } from '@shared/components/product-card/product-card';
import { ProductFilters } from '@shared/components/product-filters/product-filters';
import { ProductSort } from '@shared/components/product-sort/product-sort';
import { Skeleton } from '@shared/components/skeleton/skeleton';
import { Spinner } from '@shared/components/spinner/spinner';
import { ProductsStore } from '@state/products.store';

/**
 * Product Catalog Listing Page (/products).
 *
 * Renders desktop filter sidebar, mobile filter drawer, top sort toolbar,
 * active filter chips, paginated product grid/list, loading skeletons, and error state.
 */
@Component({
  selector: 'app-product-list',
  imports: [
    PageContainer,
    ProductCard,
    ProductFilters,
    ProductSort,
    Drawer,
    Pagination,
    Spinner,
    Skeleton,
    ErrorState,
    EmptyState,
  ],
  providers: [ProductsStore],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductList {
  protected readonly store = inject(ProductsStore);
  protected readonly mobileDrawerOpen = signal(false);

  constructor() {
    this.store.initFromUrl();
  }

  protected onPageChange(page: number): void {
    this.store.setPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected openMobileDrawer(): void {
    this.mobileDrawerOpen.set(true);
  }

  protected closeMobileDrawer(): void {
    this.mobileDrawerOpen.set(false);
  }
}
