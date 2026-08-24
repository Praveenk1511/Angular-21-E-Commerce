import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';

import { APP_URLS } from '@core/config/route-paths';
import { uniqueId } from '@core/utils/unique-id';
import { Icon } from '@shared/components/icon/icon';
import { Spinner } from '@shared/components/spinner/spinner';
import { PricePipe } from '@shared/pipes/price.pipe';
import { SearchStore } from '@state/search.store';

/**
 * Storefront header search control with autocomplete dropdown, recent searches,
 * suggestions, and direct navigation.
 */
@Component({
  selector: 'app-site-search',
  imports: [Icon, Spinner, PricePipe],
  templateUrl: './site-search.html',
  styleUrl: './site-search.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(keydown.escape)': 'closeDropdown()',
  },
})
export class SiteSearch {
  readonly enabled = input(true);
  readonly label = input('Search products');

  protected readonly store = inject(SearchStore);
  private readonly router = inject(Router);

  protected readonly inputId = uniqueId('site-search-input');
  protected readonly hintId = uniqueId('site-search-hint');

  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  protected onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.store.setQuery(val);
  }

  protected onFocus(): void {
    this.store.setOpen(true);
  }

  protected closeDropdown(): void {
    this.store.setOpen(false);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    const q = this.store.query().trim();
    if (!q) {
      return;
    }
    this.store.addRecentSearch(q);
    this.store.setOpen(false);
    this.searchInput()?.nativeElement.blur();
    void this.router.navigateByUrl(APP_URLS.search(q));
  }

  protected selectSuggestion(term: string): void {
    this.store.setQuery(term);
    this.store.addRecentSearch(term);
    this.store.setOpen(false);
    void this.router.navigateByUrl(APP_URLS.search(term));
  }

  protected selectProduct(slug: string): void {
    this.store.setOpen(false);
    void this.router.navigateByUrl(APP_URLS.productDetail(slug));
  }

  protected removeRecent(event: Event, term: string): void {
    event.stopPropagation();
    event.preventDefault();
    this.store.removeRecentSearch(term);
  }
}
