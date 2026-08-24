import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { APP_URLS } from '@core/config/route-paths';
import { Badge } from '@shared/components/badge/badge';
import { Breadcrumb } from '@shared/components/breadcrumb/breadcrumb';
import { Button } from '@shared/components/button/button';
import { EmptyState } from '@shared/components/empty-state/empty-state';
import { ErrorState } from '@shared/components/error-state/error-state';
import { PageContainer } from '@shared/components/page-container/page-container';
import { Pagination } from '@shared/components/pagination/pagination';
import { ProductCard } from '@shared/components/product-card/product-card';
import { Skeleton } from '@shared/components/skeleton/skeleton';
import { Spinner } from '@shared/components/spinner/spinner';
import { CategoryStore } from '@state/category.store';

/**
 * Category Products Detail Page (/category/:slug).
 *
 * Renders the Category Banner (title, description, product count), Subcategories bar/pills,
 * Category products grid, pagination, loading skeletons, and 404/error handling.
 */
@Component({
  selector: 'app-category-products',
  imports: [
    RouterLink,
    PageContainer,
    Breadcrumb,
    Badge,
    Button,
    ProductCard,
    Pagination,
    Spinner,
    Skeleton,
    ErrorState,
    EmptyState,
  ],
  providers: [CategoryStore],
  templateUrl: './category-products.html',
  styleUrl: './category-products.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryProducts {
  /** Bound from the `:slug` route parameter by `withComponentInputBinding()`. */
  readonly slug = input.required<string>();

  protected readonly store = inject(CategoryStore);
  protected readonly categoriesUrl = APP_URLS.categories;

  constructor() {
    effect(() => {
      const categorySlug = this.slug();
      if (categorySlug) {
        this.store.loadCategoryBySlug(categorySlug);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  protected getCategoryUrl(slug: string): string {
    return APP_URLS.categoryDetail(slug);
  }

  protected onPageChange(page: number): void {
    this.store.setPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
