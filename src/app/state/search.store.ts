import { Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, debounceTime, distinctUntilChanged, of, switchMap, tap } from 'rxjs';

import type { ProductSummary } from '@core/models';
import { CatalogService } from '@core/services/catalog.service';
import { ProductService } from '@core/services/product.service';

const RECENT_SEARCHES_KEY = 'lumen_recent_searches';
const MAX_RECENT_SEARCHES = 5;
const POPULAR_SUGGESTIONS: readonly string[] = [
  'Headphones',
  'Laptops',
  'Mechanical Keyboards',
  'Monitors',
  'Cameras',
];

/**
 * Global Product Search state manager.
 *
 * Owns live autocomplete queries using RxJS operators (debounceTime, distinctUntilChanged,
 * switchMap), recent search history persistence, and search modal/panel visibility.
 */
@Injectable({ providedIn: 'root' })
export class SearchStore {
  private readonly productService = inject(ProductService);
  private readonly catalogService = inject(CatalogService);

  private readonly searchSubject = new Subject<string>();

  // ---------- Signals ----------
  readonly query = signal('');
  readonly autocompleteResults = signal<readonly ProductSummary[]>([]);
  readonly recentSearches = signal<readonly string[]>([]);
  readonly suggestions = signal<readonly string[]>(POPULAR_SUGGESTIONS);
  readonly brandsMap = signal<ReadonlyMap<string, string>>(new Map());

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly isOpen = signal(false);

  constructor() {
    this.readStoredRecentSearches();
    this.initBrandMap();

    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap((q) => {
          const trimmed = q.trim();
          if (!trimmed) {
            this.autocompleteResults.set([]);
            this.loading.set(false);
            this.error.set(null);
          } else {
            this.loading.set(true);
            this.error.set(null);
          }
        }),
        switchMap((q) => {
          const trimmed = q.trim();
          if (!trimmed) {
            return of({ items: [] });
          }
          return this.productService.list({ q: trimmed, pageSize: 5 }).pipe(
            catchError((err: Error) => {
              this.error.set(err.message || 'Failed to fetch search results.');
              return of({ items: [] });
            }),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((res) => {
        if ('items' in res) {
          this.autocompleteResults.set(res.items);
        }
        this.loading.set(false);
      });
  }

  // ---------- Actions ----------

  setQuery(inputQuery: string): void {
    this.query.set(inputQuery);
    this.searchSubject.next(inputQuery);
    if (!this.isOpen()) {
      this.isOpen.set(true);
    }
  }

  setOpen(open: boolean): void {
    this.isOpen.set(open);
  }

  addRecentSearch(term: string): void {
    const trimmed = term.trim();
    if (!trimmed) {
      return;
    }

    const current = this.recentSearches().filter(
      (item) => item.toLowerCase() !== trimmed.toLowerCase(),
    );
    const updated = [trimmed, ...current].slice(0, MAX_RECENT_SEARCHES);
    this.recentSearches.set(updated);
    this.persistRecentSearches(updated);
  }

  removeRecentSearch(term: string): void {
    const updated = this.recentSearches().filter((item) => item !== term);
    this.recentSearches.set(updated);
    this.persistRecentSearches(updated);
  }

  clearRecentSearches(): void {
    this.recentSearches.set([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // Swallowed
    }
  }

  // ---------- Internals ----------

  private initBrandMap(): void {
    this.catalogService
      .getBrands()
      .pipe(
        tap((brands) => {
          const map = new Map<string, string>();
          for (const b of brands) {
            map.set(b.id, b.name);
          }
          this.brandsMap.set(map);
        }),
        catchError(() => of(null)),
      )
      .subscribe();
  }

  private readStoredRecentSearches(): void {
    try {
      const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) {
          this.recentSearches.set(parsed as string[]);
        }
      }
    } catch {
      // Swallowed
    }
  }

  private persistRecentSearches(list: readonly string[]): void {
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(list));
    } catch {
      // Swallowed
    }
  }
}
