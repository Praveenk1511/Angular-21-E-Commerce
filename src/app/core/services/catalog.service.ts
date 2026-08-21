import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';

import type { Brand, Category, CategoryTreeNode } from '@core/models';

import { ApiClient } from './api-client';

/** Category and brand lookups. Both collections are small and returned unpaged. */
@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly api = inject(ApiClient);

  /** `GET /categories` — nested tree, for navigation and filter panels. */
  getCategoryTree(): Observable<readonly CategoryTreeNode[]> {
    return this.api.get<readonly CategoryTreeNode[]>('/categories');
  }

  /** `GET /categories?flat=true` — every category as a flat list, for pickers. */
  getCategoriesFlat(): Observable<readonly Category[]> {
    return this.api.get<readonly Category[]>('/categories', { flat: true });
  }

  getCategory(idOrSlug: string): Observable<Category> {
    return this.api.get<Category>(`/categories/${encodeURIComponent(idOrSlug)}`);
  }

  getBrands(): Observable<readonly Brand[]> {
    return this.api.get<readonly Brand[]>('/brands');
  }

  getBrand(idOrSlug: string): Observable<Brand> {
    return this.api.get<Brand>(`/brands/${encodeURIComponent(idOrSlug)}`);
  }
}
