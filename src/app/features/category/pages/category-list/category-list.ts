import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { APP_URLS } from '@core/config/route-paths';
import { Badge } from '@shared/components/badge/badge';
import { Button } from '@shared/components/button/button';
import { ErrorState } from '@shared/components/error-state/error-state';
import { Icon } from '@shared/components/icon/icon';
import { PageContainer } from '@shared/components/page-container/page-container';
import { Skeleton } from '@shared/components/skeleton/skeleton';
import { Spinner } from '@shared/components/spinner/spinner';
import { CategoryStore } from '@state/category.store';

/**
 * Category List Overview Page (/categories).
 *
 * Renders top-level category cards with subcategories badges/links, descriptions,
 * product counts, and call-to-action buttons.
 */
@Component({
  selector: 'app-category-list',
  imports: [RouterLink, PageContainer, Badge, Button, Icon, Spinner, Skeleton, ErrorState],
  providers: [CategoryStore],
  templateUrl: './category-list.html',
  styleUrl: './category-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryList {
  protected readonly store = inject(CategoryStore);

  constructor() {
    this.store.loadCategoriesOverview();
  }

  protected getCategoryUrl(slug: string): string {
    return APP_URLS.categoryDetail(slug);
  }
}
