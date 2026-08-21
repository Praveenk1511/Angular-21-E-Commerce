import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { APP_URLS } from '@core/config/route-paths';
import type { CategoryTreeNode } from '@core/models';
import { SectionHeader } from '@shared/components/section-header/section-header';

@Component({
  selector: 'app-featured-categories',
  imports: [RouterLink, SectionHeader],
  templateUrl: './featured-categories.html',
  styleUrl: './featured-categories.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeaturedCategories {
  readonly categories = input.required<readonly CategoryTreeNode[]>();

  protected categoryUrl(slug: string): string {
    return APP_URLS.categoryDetail(slug);
  }
}
