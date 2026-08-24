import { Injectable, computed, signal } from '@angular/core';

import type { Product, StockStatus } from '@core/models';

const ADMIN_CATALOG_KEY = 'lumen_admin_catalog';

const MOCK_INITIAL_CATALOG: readonly Product[] = [
  {
    id: 'prod-1',
    slug: 'ergonomic-desk-chair-pro',
    sku: 'CHAIR-ERG-01',
    name: 'Ergonomic Desk Chair Pro',
    brandId: 'brand-1',
    categoryId: 'cat-1',
    summary: 'Adjustable lumbar support with breathable mesh back and 3D armrests.',
    description: 'Designed for 8+ hour workdays, this chair features dynamic lumbar support, breathable mesh upholstery, dual-wheel smooth casters, and 3D armrests to ensure optimal posture.',
    price: { currency: 'GBP', amountMinor: 34999, compareAtMinor: 39999 },
    thumbnail: {
      url: 'https://images.unsplash.com/photo-1580481072645-022f9a6d8310?auto=format&fit=crop&w=600&q=80',
      alt: 'Ergonomic Desk Chair Pro',
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1580481072645-022f9a6d8310?auto=format&fit=crop&w=600&q=80',
        alt: 'Ergonomic Desk Chair Pro Main View',
      },
    ],
    rating: { average: 4.8, count: 42, distribution: [0, 1, 3, 10, 28] },
    stock: { status: 'in-stock', available: 18 },
    badges: ['bestseller'],
    specifications: [
      { label: 'Weight Capacity', value: '150 kg' },
      { label: 'Frame Material', value: 'Aluminum & Reinforced Polymer' },
      { label: 'Warranty', value: '24 Months' },
    ],
    tags: ['chair', 'furniture', 'ergonomic', 'office'],
    lifecycle: 'active',
    weightGrams: 14500,
    warrantyMonths: 24,
    relatedProductIds: ['prod-2', 'prod-3'],
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'prod-2',
    slug: 'precision-wireless-mouse',
    sku: 'MOUSE-PREC-02',
    name: 'Precision Wireless Mouse',
    brandId: 'brand-2',
    categoryId: 'cat-2',
    summary: 'High-precision 8K DPI optical sensor with silent click switches.',
    description: 'Crafted for productivity professionals, this mouse offers fast electromagnetic scrolling, quiet tactile switches, and dual Bluetooth / 2.4GHz wireless connectivity.',
    price: { currency: 'GBP', amountMinor: 7999, compareAtMinor: 9999 },
    thumbnail: {
      url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80',
      alt: 'Precision Wireless Mouse',
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80',
        alt: 'Precision Wireless Mouse Angle View',
      },
    ],
    rating: { average: 4.6, count: 28, distribution: [0, 0, 4, 8, 16] },
    stock: { status: 'low-stock', available: 4 },
    badges: ['low-stock', 'sale'],
    specifications: [
      { label: 'DPI Sensor', value: '8000 DPI Optical' },
      { label: 'Battery Life', value: 'Up to 70 days per charge' },
      { label: 'Connectivity', value: 'Bluetooth 5.2 + 2.4GHz USB' },
    ],
    tags: ['mouse', 'peripherals', 'wireless'],
    lifecycle: 'active',
    weightGrams: 141,
    warrantyMonths: 12,
    relatedProductIds: ['prod-1', 'prod-5'],
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'prod-3',
    slug: 'wireless-noise-cancelling-headphones',
    sku: 'HEAD-ANC-03',
    name: 'Wireless Noise-Cancelling Headphones',
    brandId: 'brand-3',
    categoryId: 'cat-3',
    summary: 'Adaptive hybrid ANC with 40mm drivers and 30-hour playback.',
    description: 'Immerse yourself in high-fidelity audio with active noise cancellation, custom EQ settings via companion app, and memory foam cushion comfort.',
    price: { currency: 'GBP', amountMinor: 24999 },
    thumbnail: {
      url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
      alt: 'Wireless Noise-Cancelling Headphones',
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
        alt: 'Wireless Headphones View',
      },
    ],
    rating: { average: 4.9, count: 56, distribution: [0, 0, 2, 8, 46] },
    stock: { status: 'in-stock', available: 45 },
    badges: ['new'],
    specifications: [
      { label: 'Driver Size', value: '40mm Neodymium' },
      { label: 'ANC Type', value: 'Hybrid Active Noise Cancellation' },
      { label: 'Playtime', value: '30 hours (ANC On)' },
    ],
    tags: ['headphones', 'audio', 'wireless', 'anc'],
    lifecycle: 'active',
    weightGrams: 254,
    warrantyMonths: 24,
    relatedProductIds: ['prod-1', 'prod-2'],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'prod-4',
    slug: 'ultra-wide-34-curved-monitor',
    sku: 'MON-CURV-04',
    name: 'Ultra-Wide 34" Curved Monitor',
    brandId: 'brand-2',
    categoryId: 'cat-2',
    summary: 'WQHD 3440x1440 144Hz curved display with USB-C 90W power delivery.',
    description: 'Expand your workstation with crisp 1500R curvature, HDR400 color precision, and single-cable USB-C docking with 90W laptop charging.',
    price: { currency: 'GBP', amountMinor: 69999, compareAtMinor: 79999 },
    thumbnail: {
      url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80',
      alt: 'Ultra-Wide 34 Curved Monitor',
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80',
        alt: 'Ultra-Wide Curved Monitor Front View',
      },
    ],
    rating: { average: 4.7, count: 19, distribution: [0, 1, 1, 4, 13] },
    stock: { status: 'low-stock', available: 2 },
    badges: ['low-stock', 'sale'],
    specifications: [
      { label: 'Resolution', value: 'WQHD (3440 x 1440)' },
      { label: 'Refresh Rate', value: '144Hz' },
      { label: 'Panel Type', value: 'VA 1500R Curved' },
    ],
    tags: ['monitor', 'display', 'ultrawide'],
    lifecycle: 'active',
    weightGrams: 8200,
    warrantyMonths: 36,
    relatedProductIds: ['prod-6'],
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'prod-5',
    slug: 'mechanical-tactile-keyboard',
    sku: 'KEY-MECH-05',
    name: 'Mechanical Tactile Keyboard',
    brandId: 'brand-2',
    categoryId: 'cat-2',
    summary: 'Hot-swappable tactile key switches with per-key RGB backlighting.',
    description: 'Features hot-swappable mechanical switches, PBT double-shot keycaps, sound dampening foam, and full N-key rollover.',
    price: { currency: 'GBP', amountMinor: 12999 },
    thumbnail: {
      url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
      alt: 'Mechanical Tactile Keyboard',
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
        alt: 'Mechanical Keyboard View',
      },
    ],
    rating: { average: 4.5, count: 32, distribution: [0, 2, 3, 9, 18] },
    stock: { status: 'out-of-stock', available: 0 },
    badges: [],
    specifications: [
      { label: 'Switch Type', value: 'Tactile Mechanical' },
      { label: 'Keycap Material', value: 'Double-shot PBT' },
      { label: 'Backlight', value: 'Per-Key RGB' },
    ],
    tags: ['keyboard', 'mechanical', 'rgb'],
    lifecycle: 'active',
    weightGrams: 980,
    warrantyMonths: 24,
    relatedProductIds: ['prod-2'],
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export interface SaveProductPayload {
  readonly id?: string;
  readonly name: string;
  readonly sku: string;
  readonly categoryId: string;
  readonly brandId: string;
  readonly priceAmount: number;
  readonly compareAtPrice?: number | null;
  readonly currency: 'GBP' | 'EUR' | 'USD';
  readonly availableStock: number;
  readonly stockStatus: StockStatus;
  readonly summary: string;
  readonly description: string;
  readonly weightGrams: number;
  readonly warrantyMonths: number;
  readonly variantsText?: string;
  readonly imageUrl: string;
  readonly specifications: readonly { label: string; value: string }[];
}

/**
 * Root state manager for Admin Product Catalog CRUD, Filtering, Pagination,
 * and Product Details inspection modal.
 */
@Injectable({ providedIn: 'root' })
export class AdminProductStore {
  // ---------- State Signals ----------
  private readonly productsSignal = signal<readonly Product[]>([]);
  readonly searchQuery = signal<string>('');
  readonly activePage = signal<number>(1);
  readonly pageSize = signal<number>(5);

  readonly isFormOpen = signal<boolean>(false);
  readonly editingProduct = signal<Product | null>(null);
  readonly viewingProduct = signal<Product | null>(null);

  // ---------- Derived Data ----------

  readonly paginatedData = computed(() => {
    let list = [...this.productsSignal()];
    const q = this.searchQuery().trim().toLowerCase();

    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q) ||
          p.categoryId.toLowerCase().includes(q),
      );
    }

    const totalCount = list.length;
    const size = this.pageSize();
    const totalPages = Math.max(1, Math.ceil(totalCount / size));
    const currentPage = Math.min(this.activePage(), totalPages);

    const startIndex = (currentPage - 1) * size;
    const items = list.slice(startIndex, startIndex + size);

    return {
      items,
      totalCount,
      totalPages,
      currentPage,
    };
  });

  constructor() {
    this.readStoredCatalog();
  }

  // ---------- Navigation Actions ----------

  setSearchQuery(q: string): void {
    this.searchQuery.set(q);
    this.activePage.set(1);
  }

  setPage(page: number): void {
    this.activePage.set(page);
  }

  // ---------- Modal Controls ----------

  openAddModal(): void {
    this.editingProduct.set(null);
    this.viewingProduct.set(null);
    this.isFormOpen.set(true);
  }

  openEditModal(product: Product): void {
    this.editingProduct.set(product);
    this.viewingProduct.set(null);
    this.isFormOpen.set(true);
  }

  openViewModal(product: Product): void {
    this.viewingProduct.set(product);
  }

  closeModals(): void {
    this.isFormOpen.set(false);
    this.editingProduct.set(null);
    this.viewingProduct.set(null);
  }

  // ---------- CRUD Actions ----------

  saveProduct(payload: SaveProductPayload): Product {
    const amountMinor = Math.round(payload.priceAmount * 100);
    const compareAtMinor = payload.compareAtPrice
      ? Math.round(payload.compareAtPrice * 100)
      : undefined;

    const existing = payload.id
      ? this.productsSignal().find((p) => p.id === payload.id)
      : null;

    const slug = payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const saved: Product = {
      id: existing ? existing.id : `prod-${Date.now()}`,
      slug: existing ? existing.slug : slug,
      sku: payload.sku.toUpperCase().trim(),
      name: payload.name.trim(),
      brandId: payload.brandId || 'brand-1',
      categoryId: payload.categoryId || 'cat-1',
      summary: payload.summary.trim(),
      description: payload.description.trim(),
      price: {
        currency: payload.currency,
        amountMinor,
        ...(compareAtMinor !== undefined ? { compareAtMinor } : {}),
      },
      thumbnail: {
        url: payload.imageUrl.trim(),
        alt: payload.name.trim(),
      },
      images: [
        {
          url: payload.imageUrl.trim(),
          alt: payload.name.trim(),
        },
      ],
      rating: existing ? existing.rating : { average: 5.0, count: 1, distribution: [0, 0, 0, 0, 1] },
      stock: {
        status: payload.stockStatus,
        available: payload.availableStock,
      },
      badges: compareAtMinor ? ['sale'] : [],
      specifications: payload.specifications.map((s) => ({
        label: s.label.trim(),
        value: s.value.trim(),
      })),
      tags: [payload.categoryId, 'catalog'],
      lifecycle: 'active',
      weightGrams: payload.weightGrams,
      warrantyMonths: payload.warrantyMonths,
      relatedProductIds: existing ? existing.relatedProductIds : ['prod-1'],
      createdAt: existing ? existing.createdAt : new Date().toISOString(),
    };

    const list = [...this.productsSignal()];
    if (existing) {
      const idx = list.findIndex((p) => p.id === existing.id);
      if (idx !== -1) {
        list[idx] = saved;
      }
    } else {
      list.unshift(saved);
    }

    this.updateCatalogState(list);
    this.closeModals();
    return saved;
  }

  deleteProduct(id: string): boolean {
    const updated = this.productsSignal().filter((p) => p.id !== id);
    this.updateCatalogState(updated);
    if (this.viewingProduct()?.id === id) {
      this.viewingProduct.set(null);
    }
    return true;
  }

  // ---------- Internals ----------

  private updateCatalogState(list: readonly Product[]): void {
    this.productsSignal.set(list);
    this.persistCatalog(list);
  }

  private readStoredCatalog(): void {
    try {
      const raw = localStorage.getItem(ADMIN_CATALOG_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.productsSignal.set(parsed as Product[]);
          return;
        }
      }
    } catch {
      // Swallowed
    }

    this.productsSignal.set(MOCK_INITIAL_CATALOG);
    this.persistCatalog(MOCK_INITIAL_CATALOG);
  }

  private persistCatalog(list: readonly Product[]): void {
    try {
      localStorage.setItem(ADMIN_CATALOG_KEY, JSON.stringify(list));
    } catch {
      // Swallowed
    }
  }
}
