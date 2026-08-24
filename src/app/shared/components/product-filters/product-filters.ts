import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';

import type { CategoryTreeNode, ProductFacets } from '@core/models';
import { Badge } from '@shared/components/badge/badge';
import { Icon } from '@shared/components/icon/icon';
import { Rating } from '@shared/components/rating/rating';

export interface ActiveFilterChip {
  readonly id: string;
  readonly type: 'category' | 'brand' | 'price' | 'rating' | 'inStock' | 'onSale';
  readonly label: string;
  readonly value: string | number | boolean | null;
}

@Component({
  selector: 'app-product-filters',
  imports: [Badge, Icon, Rating],
  templateUrl: './product-filters.html',
  styleUrl: './product-filters.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFilters {
  readonly facets = input<ProductFacets | null>(null);
  readonly categories = input<readonly CategoryTreeNode[]>([]);
  readonly selectedCategory = input<string | null>(null);
  readonly selectedBrands = input<readonly string[]>([]);
  readonly minPrice = input<number | null>(null);
  readonly maxPrice = input<number | null>(null);
  readonly minRating = input<number | null>(null);
  readonly inStockOnly = input<boolean>(false);
  readonly onSaleOnly = input<boolean>(false);

  readonly categoryChange = output<string | null>();
  readonly brandChange = output<readonly string[]>();
  readonly priceRangeChange = output<{ min: number | null; max: number | null }>();
  readonly ratingChange = output<number | null>();
  readonly inStockChange = output<boolean>();
  readonly onSaleChange = output<boolean>();
  readonly resetFilters = output<void>();

  // Internal inputs state for price range inputs
  protected readonly localMinPrice = signal<string>('');
  protected readonly localMaxPrice = signal<string>('');

  protected readonly activeChips = computed<readonly ActiveFilterChip[]>(() => {
    const chips: ActiveFilterChip[] = [];

    const catId = this.selectedCategory();
    if (catId) {
      const catName = this.findCategoryName(this.categories(), catId) || catId;
      chips.push({ id: `cat-${catId}`, type: 'category', label: `Category: ${catName}`, value: catId });
    }

    const brands = this.selectedBrands();
    const facetBrands = this.facets()?.brands || [];
    for (const bId of brands) {
      const bObj = facetBrands.find((f) => f.id === bId);
      const bName = bObj ? bObj.label : bId;
      chips.push({ id: `brand-${bId}`, type: 'brand', label: `Brand: ${bName}`, value: bId });
    }

    const minP = this.minPrice();
    const maxP = this.maxPrice();
    if (minP !== null && maxP !== null) {
      chips.push({ id: 'price-range', type: 'price', label: `Price: £${minP} - £${maxP}`, value: null });
    } else if (minP !== null) {
      chips.push({ id: 'price-min', type: 'price', label: `Price: >= £${minP}`, value: null });
    } else if (maxP !== null) {
      chips.push({ id: 'price-max', type: 'price', label: `Price: <= £${maxP}`, value: null });
    }

    const rating = this.minRating();
    if (rating !== null) {
      chips.push({ id: 'rating-chip', type: 'rating', label: `Rating: ${rating}★ & above`, value: rating });
    }

    if (this.inStockOnly()) {
      chips.push({ id: 'instock-chip', type: 'inStock', label: 'In Stock Only', value: true });
    }

    if (this.onSaleOnly()) {
      chips.push({ id: 'onsale-chip', type: 'onSale', label: 'On Sale Only', value: true });
    }

    return chips;
  });

  protected readonly hasActiveFilters = computed(() => this.activeChips().length > 0);

  protected onCategorySelect(catId: string | null): void {
    this.categoryChange.emit(catId);
  }

  protected onBrandToggle(brandId: string, checked: boolean): void {
    const current = [...this.selectedBrands()];
    if (checked) {
      if (!current.includes(brandId)) {
        current.push(brandId);
      }
    } else {
      const idx = current.indexOf(brandId);
      if (idx !== -1) {
        current.splice(idx, 1);
      }
    }
    this.brandChange.emit(current);
  }

  protected applyPriceFilter(): void {
    const minVal = this.localMinPrice().trim() ? Number(this.localMinPrice()) : null;
    const maxVal = this.localMaxPrice().trim() ? Number(this.localMaxPrice()) : null;

    const validMin = minVal !== null && !isNaN(minVal) && minVal >= 0 ? minVal : null;
    const validMax = maxVal !== null && !isNaN(maxVal) && maxVal >= 0 ? maxVal : null;

    this.priceRangeChange.emit({ min: validMin, max: validMax });
  }

  protected onRatingSelect(rating: number | null): void {
    this.ratingChange.emit(rating);
  }

  protected onInStockToggle(checked: boolean): void {
    this.inStockChange.emit(checked);
  }

  protected onOnSaleToggle(checked: boolean): void {
    this.onSaleChange.emit(checked);
  }

  protected removeChip(chip: ActiveFilterChip): void {
    switch (chip.type) {
      case 'category':
        this.categoryChange.emit(null);
        break;
      case 'brand':
        if (typeof chip.value === 'string') {
          this.onBrandToggle(chip.value, false);
        }
        break;
      case 'price':
        this.localMinPrice.set('');
        this.localMaxPrice.set('');
        this.priceRangeChange.emit({ min: null, max: null });
        break;
      case 'rating':
        this.ratingChange.emit(null);
        break;
      case 'inStock':
        this.inStockChange.emit(false);
        break;
      case 'onSale':
        this.onSaleChange.emit(false);
        break;
    }
  }

  protected onResetAll(): void {
    this.localMinPrice.set('');
    this.localMaxPrice.set('');
    this.resetFilters.emit();
  }

  private findCategoryName(tree: readonly CategoryTreeNode[], id: string): string | null {
    for (const node of tree) {
      if (node.id === id) {
        return node.name;
      }
      if (node.children) {
        const found = this.findCategoryName(node.children, id);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }
}
