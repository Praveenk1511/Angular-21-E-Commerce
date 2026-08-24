import { Injectable, computed, signal } from '@angular/core';

import type { Category } from '@core/models';

const ADMIN_CATEGORIES_KEY = 'lumen_admin_categories';

const MOCK_INITIAL_CATEGORIES: readonly Category[] = [
  {
    id: 'cat-1',
    slug: 'furniture-home',
    name: 'Furniture & Home',
    description: 'Ergonomic chairs, standing desks, lumbar cushions, and office furnishings.',
    parentId: null,
    position: 1,
    productCount: 12,
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
    status: 'active',
  },
  {
    id: 'cat-2',
    slug: 'electronics-workstation',
    name: 'Electronics & Workstation',
    description: 'Curved monitors, thunderbolt docks, keyboards, mice, and computer hardware.',
    parentId: null,
    position: 2,
    productCount: 24,
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80',
    status: 'active',
  },
  {
    id: 'cat-3',
    slug: 'audio-sound',
    name: 'Audio & Sound',
    description: 'Noise-cancelling headphones, wireless earbuds, desk microphones, and speakers.',
    parentId: null,
    position: 3,
    productCount: 8,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    status: 'active',
  },
  {
    id: 'cat-4',
    slug: 'accessories',
    name: 'Accessories & Cables',
    description: 'Braided USB-C cables, desk pads, cable management sleeves, and laptop stands.',
    parentId: null,
    position: 4,
    productCount: 4,
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
    status: 'active',
  },
  {
    id: 'subcat-1',
    slug: 'office-chairs',
    name: 'Office Chairs',
    description: 'Task chairs, executive seating, and ergonomic mesh posture chairs.',
    parentId: 'cat-1',
    position: 1,
    productCount: 6,
    imageUrl: 'https://images.unsplash.com/photo-1580481072645-022f9a6d8310?auto=format&fit=crop&w=600&q=80',
    status: 'active',
  },
  {
    id: 'subcat-2',
    slug: 'desk-lamps',
    name: 'Desk Lamps & Lights',
    description: 'LED monitor light bars, ambient desk illumination, and eye-care lamps.',
    parentId: 'cat-1',
    position: 2,
    productCount: 4,
    status: 'active',
  },
  {
    id: 'subcat-3',
    slug: 'monitors',
    name: 'Monitors & Displays',
    description: '4K IPS panels, ultra-wide curved gaming & productivity screens.',
    parentId: 'cat-2',
    position: 1,
    productCount: 10,
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80',
    status: 'active',
  },
  {
    id: 'subcat-4',
    slug: 'keyboards-mice',
    name: 'Keyboards & Mice',
    description: 'Tactile mechanical keyboards, ergonomic mice, and trackballs.',
    parentId: 'cat-2',
    position: 2,
    productCount: 8,
    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80',
    status: 'active',
  },
];

export interface SaveCategoryPayload {
  readonly id?: string;
  readonly name: string;
  readonly slug?: string;
  readonly parentId?: string | null;
  readonly description: string;
  readonly imageUrl?: string;
  readonly position?: number;
  readonly status: 'active' | 'inactive';
}

/**
 * Root state manager for Admin Category CRUD, subcategories hierarchy,
 * search filtering, and destructive deletion confirmation dialogs.
 */
@Injectable({ providedIn: 'root' })
export class AdminCategoryStore {
  // ---------- State Signals ----------
  private readonly categoriesSignal = signal<readonly Category[]>([]);
  readonly searchQuery = signal<string>('');
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly isFormOpen = signal<boolean>(false);
  readonly editingCategory = signal<Category | null>(null);
  readonly confirmingDeleteCategory = signal<Category | null>(null);

  // ---------- Derived Signals ----------

  readonly parentCategories = computed(() =>
    this.categoriesSignal().filter((c) => c.parentId === null),
  );

  readonly filteredCategories = computed(() => {
    let list = [...this.categoriesSignal()];
    const q = this.searchQuery().trim().toLowerCase();

    if (q) {
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q),
      );
    }

    return list.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  });

  readonly totalCount = computed(() => this.categoriesSignal().length);

  constructor() {
    this.readStoredCategories();
  }

  // ---------- Search & Filter Actions ----------

  setSearchQuery(q: string): void {
    this.searchQuery.set(q);
  }

  getParentCategoryName(parentId: string | null): string {
    if (!parentId) return 'None (Top-Level)';
    const found = this.categoriesSignal().find((c) => c.id === parentId);
    return found ? found.name : 'Top-Level';
  }

  // ---------- Modal & Dialog Controls ----------

  openAddModal(): void {
    this.editingCategory.set(null);
    this.isFormOpen.set(true);
  }

  openEditModal(category: Category): void {
    this.editingCategory.set(category);
    this.isFormOpen.set(true);
  }

  promptDelete(category: Category): void {
    this.confirmingDeleteCategory.set(category);
  }

  cancelDelete(): void {
    this.confirmingDeleteCategory.set(null);
  }

  closeModals(): void {
    this.isFormOpen.set(false);
    this.editingCategory.set(null);
    this.confirmingDeleteCategory.set(null);
  }

  // ---------- CRUD Actions ----------

  saveCategory(payload: SaveCategoryPayload): Category {
    const existing = payload.id
      ? this.categoriesSignal().find((c) => c.id === payload.id)
      : null;

    const slug = (
      payload.slug && payload.slug.trim().length > 0
        ? payload.slug
        : payload.name
    )
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const saved: Category = {
      id: existing ? existing.id : `cat-${Date.now()}`,
      slug,
      name: payload.name.trim(),
      description: payload.description.trim(),
      parentId: payload.parentId || null,
      position: payload.position ?? 1,
      productCount: existing ? existing.productCount : 0,
      ...(payload.imageUrl && payload.imageUrl.trim().length > 0
        ? { imageUrl: payload.imageUrl.trim() }
        : {}),
      status: payload.status,
    };

    const list = [...this.categoriesSignal()];
    if (existing) {
      const idx = list.findIndex((c) => c.id === existing.id);
      if (idx !== -1) {
        list[idx] = saved;
      }
    } else {
      list.push(saved);
    }

    this.updateState(list);
    this.closeModals();
    return saved;
  }

  deleteCategory(id: string): boolean {
    const updated = this.categoriesSignal().filter((c) => c.id !== id);
    this.updateState(updated);
    this.confirmingDeleteCategory.set(null);
    return true;
  }

  // ---------- Internals ----------

  private updateState(list: readonly Category[]): void {
    this.categoriesSignal.set(list);
    this.persistCategories(list);
  }

  private readStoredCategories(): void {
    try {
      const raw = localStorage.getItem(ADMIN_CATEGORIES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.categoriesSignal.set(parsed as Category[]);
          return;
        }
      }
    } catch {
      // Swallowed
    }

    this.categoriesSignal.set(MOCK_INITIAL_CATEGORIES);
    this.persistCategories(MOCK_INITIAL_CATEGORIES);
  }

  private persistCategories(list: readonly Category[]): void {
    try {
      localStorage.setItem(ADMIN_CATEGORIES_KEY, JSON.stringify(list));
    } catch {
      // Swallowed
    }
  }
}
