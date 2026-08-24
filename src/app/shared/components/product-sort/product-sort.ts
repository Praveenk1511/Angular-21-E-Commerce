import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Badge } from '@shared/components/badge/badge';
import { Icon } from '@shared/components/icon/icon';
import { Select } from '@shared/components/select/select';
import type { ChoiceOption } from '@shared/models/option.model';

export const SORT_OPTIONS: readonly ChoiceOption[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Customer Rating' },
  { value: 'newest', label: 'Newest Arrivals' },
];

@Component({
  selector: 'app-product-sort',
  imports: [FormsModule, Badge, Icon, Select],
  templateUrl: './product-sort.html',
  styleUrl: './product-sort.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductSort {
  readonly totalItems = input<number>(0);
  readonly sort = input<string>('relevance');
  readonly viewMode = input<'grid' | 'list'>('grid');
  readonly activeFilterCount = input<number>(0);

  readonly sortChange = output<string>();
  readonly viewModeChange = output<'grid' | 'list'>();
  readonly openMobileFilters = output<void>();

  protected readonly options = SORT_OPTIONS;

  protected onSortSelect(val: string): void {
    if (val) {
      this.sortChange.emit(val);
    }
  }

  protected setViewMode(mode: 'grid' | 'list'): void {
    this.viewModeChange.emit(mode);
  }

  protected triggerMobileFilters(): void {
    this.openMobileFilters.emit();
  }
}
