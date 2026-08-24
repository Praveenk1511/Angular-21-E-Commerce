import { Injectable, computed, inject, signal } from '@angular/core';

import type { InventoryRecord, StockHistoryItem, StockStatus } from '@core/models';
import { AdminProductStore } from './admin-product.store';

const INVENTORY_STORAGE_KEY = 'lumen_admin_inventory';
const INVENTORY_HISTORY_KEY = 'lumen_admin_inventory_history';

const MOCK_INITIAL_INVENTORY: readonly InventoryRecord[] = [
  {
    productId: 'prod-1',
    productName: 'Ergonomic Desk Chair Pro',
    sku: 'CHAIR-ERG-01',
    warehouseCode: 'WH-LON-01',
    onHand: 20,
    reserved: 2,
    available: 18,
    reorderLevel: 5,
    reorderQuantity: 25,
    status: 'in-stock',
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    incomingAt: null,
    incomingQuantity: 0,
  },
  {
    productId: 'prod-2',
    productName: 'Precision Wireless Mouse',
    sku: 'MOUSE-PREC-02',
    warehouseCode: 'WH-LON-01',
    onHand: 6,
    reserved: 2,
    available: 4,
    reorderLevel: 5,
    reorderQuantity: 30,
    status: 'low-stock',
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    incomingAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    incomingQuantity: 50,
  },
  {
    productId: 'prod-3',
    productName: 'Wireless Noise-Cancelling Headphones',
    sku: 'HEAD-ANC-03',
    warehouseCode: 'WH-LON-01',
    onHand: 50,
    reserved: 5,
    available: 45,
    reorderLevel: 10,
    reorderQuantity: 40,
    status: 'in-stock',
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    incomingAt: null,
    incomingQuantity: 0,
  },
  {
    productId: 'prod-4',
    productName: 'Ultra-Wide 34" Curved Monitor',
    sku: 'MON-CURV-04',
    warehouseCode: 'WH-LON-01',
    onHand: 3,
    reserved: 1,
    available: 2,
    reorderLevel: 5,
    reorderQuantity: 15,
    status: 'low-stock',
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    incomingAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    incomingQuantity: 20,
  },
  {
    productId: 'prod-5',
    productName: 'Mechanical Tactile Keyboard',
    sku: 'KEY-MECH-05',
    warehouseCode: 'WH-LON-01',
    onHand: 0,
    reserved: 0,
    available: 0,
    reorderLevel: 5,
    reorderQuantity: 50,
    status: 'out-of-stock',
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    incomingAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    incomingQuantity: 100,
  },
  {
    productId: 'prod-6',
    productName: 'Thunderbolt 4 Multi-Port Dock',
    sku: 'DOCK-TB4-06',
    warehouseCode: 'WH-LON-01',
    onHand: 14,
    reserved: 2,
    available: 12,
    reorderLevel: 5,
    reorderQuantity: 20,
    status: 'in-stock',
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    incomingAt: null,
    incomingQuantity: 0,
  },
];

const MOCK_INITIAL_HISTORY: readonly StockHistoryItem[] = [
  {
    id: 'hist-1',
    productId: 'prod-1',
    sku: 'CHAIR-ERG-01',
    productName: 'Ergonomic Desk Chair Pro',
    delta: 20,
    reason: 'Initial warehouse intake',
    performedBy: 'Logistics Manager',
    timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    newOnHand: 20,
  },
  {
    id: 'hist-2',
    productId: 'prod-2',
    sku: 'MOUSE-PREC-02',
    productName: 'Precision Wireless Mouse',
    delta: -4,
    reason: 'Customer orders fulfillment',
    performedBy: 'Fulfillment System',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    newOnHand: 6,
  },
  {
    id: 'hist-3',
    productId: 'prod-5',
    sku: 'KEY-MECH-05',
    productName: 'Mechanical Tactile Keyboard',
    delta: -15,
    reason: 'Sold out during flash sale',
    performedBy: 'Fulfillment System',
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    newOnHand: 0,
  },
];

export interface AdjustStockPayload {
  readonly productId: string;
  readonly delta: number;
  readonly reason: string;
  readonly newReorderLevel?: number;
}

/**
 * Root state manager for Admin Inventory Management, SKU stock levels,
 * Low-stock threshold alerts, Stock adjustments, and Audit history movement logs.
 */
@Injectable({ providedIn: 'root' })
export class AdminInventoryStore {
  private readonly productStore = inject(AdminProductStore);

  // ---------- State Signals ----------
  private readonly recordsSignal = signal<readonly InventoryRecord[]>([]);
  private readonly historySignal = signal<readonly StockHistoryItem[]>([]);

  readonly searchQuery = signal<string>('');
  readonly statusFilter = signal<'all' | 'in-stock' | 'low-stock' | 'out-of-stock'>('all');

  readonly activePage = signal<number>(1);
  readonly pageSize = signal<number>(5);

  readonly adjustingRecord = signal<InventoryRecord | null>(null);
  readonly viewingHistoryRecord = signal<InventoryRecord | null>(null);

  // ---------- Derived Signals ----------

  readonly totalSkusCount = computed(() => this.recordsSignal().length);

  readonly lowStockCount = computed(
    () => this.recordsSignal().filter((r) => r.status === 'low-stock').length,
  );

  readonly outOfStockCount = computed(
    () => this.recordsSignal().filter((r) => r.status === 'out-of-stock').length,
  );

  readonly paginatedData = computed(() => {
    let list = [...this.recordsSignal()];
    const q = this.searchQuery().trim().toLowerCase();
    const st = this.statusFilter();

    if (q) {
      list = list.filter(
        (r) =>
          r.sku.toLowerCase().includes(q) ||
          r.productName.toLowerCase().includes(q) ||
          r.warehouseCode.toLowerCase().includes(q),
      );
    }

    if (st !== 'all') {
      list = list.filter((r) => r.status === st);
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

  readonly selectedProductHistory = computed(() => {
    const target = this.viewingHistoryRecord();
    if (!target) return [];

    return this.historySignal()
      .filter((h) => h.productId === target.productId || h.sku === target.sku)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  });

  constructor() {
    this.readStoredData();
  }

  // ---------- Search & Filter Actions ----------

  setSearchQuery(q: string): void {
    this.searchQuery.set(q);
    this.activePage.set(1);
  }

  setStatusFilter(status: 'all' | 'in-stock' | 'low-stock' | 'out-of-stock'): void {
    this.statusFilter.set(status);
    this.activePage.set(1);
  }

  setPage(page: number): void {
    this.activePage.set(page);
  }

  openAdjustModal(record: InventoryRecord): void {
    this.adjustingRecord.set(record);
  }

  openHistoryDrawer(record: InventoryRecord): void {
    this.viewingHistoryRecord.set(record);
  }

  closeModals(): void {
    this.adjustingRecord.set(null);
    this.viewingHistoryRecord.set(null);
  }

  // ---------- Stock Adjustment Actions ----------

  adjustStock(payload: AdjustStockPayload): { success: boolean; message: string } {
    const list = [...this.recordsSignal()];
    const idx = list.findIndex((r) => r.productId === payload.productId);

    if (idx === -1) {
      return { success: false, message: `Inventory record for product "${payload.productId}" not found.` };
    }

    const record = list[idx]!;
    const newOnHand = Math.max(0, record.onHand + payload.delta);
    const newAvailable = Math.max(0, newOnHand - record.reserved);
    const reorderLevel = payload.newReorderLevel ?? record.reorderLevel;

    // Recalculate status based on threshold level
    let status: StockStatus = 'in-stock';
    if (newAvailable === 0) {
      status = 'out-of-stock';
    } else if (newAvailable <= reorderLevel) {
      status = 'low-stock';
    }

    const nowIso = new Date().toISOString();

    const updatedRecord: InventoryRecord = {
      ...record,
      onHand: newOnHand,
      available: newAvailable,
      reorderLevel,
      status,
      updatedAt: nowIso,
    };

    list[idx] = updatedRecord;
    this.updateRecordsState(list);

    // Log Stock Movement History Item
    const historyItem: StockHistoryItem = {
      id: `hist-${Date.now()}`,
      productId: record.productId,
      sku: record.sku,
      productName: record.productName,
      delta: payload.delta,
      reason: payload.reason.trim(),
      performedBy: 'Admin User',
      timestamp: nowIso,
      newOnHand,
    };

    const newHistory = [historyItem, ...this.historySignal()];
    this.updateHistoryState(newHistory);

    // Sync stock update with AdminProductStore if matching product exists
    const catalogProduct = this.productStore.paginatedData().items.find((p) => p.id === record.productId);
    if (catalogProduct) {
      this.productStore.saveProduct({
        id: catalogProduct.id,
        name: catalogProduct.name,
        sku: catalogProduct.sku,
        categoryId: catalogProduct.categoryId,
        brandId: catalogProduct.brandId,
        priceAmount: catalogProduct.price.amountMinor / 100,
        compareAtPrice: catalogProduct.price.compareAtMinor ? catalogProduct.price.compareAtMinor / 100 : null,
        currency: catalogProduct.price.currency,
        availableStock: newAvailable,
        stockStatus: status,
        summary: catalogProduct.summary,
        description: catalogProduct.description,
        weightGrams: catalogProduct.weightGrams,
        warrantyMonths: catalogProduct.warrantyMonths,
        imageUrl: catalogProduct.thumbnail.url,
        specifications: catalogProduct.specifications,
      });
    }

    this.closeModals();
    return {
      success: true,
      message: `Stock for ${record.productName} (${record.sku}) updated to ${newOnHand} units.`,
    };
  }

  // ---------- Internals ----------

  private updateRecordsState(list: readonly InventoryRecord[]): void {
    this.recordsSignal.set(list);
    this.persistData(INVENTORY_STORAGE_KEY, list);
  }

  private updateHistoryState(history: readonly StockHistoryItem[]): void {
    this.historySignal.set(history);
    this.persistData(INVENTORY_HISTORY_KEY, history);
  }

  private readStoredData(): void {
    try {
      const rawRecords = localStorage.getItem(INVENTORY_STORAGE_KEY);
      if (rawRecords) {
        const parsed = JSON.parse(rawRecords) as unknown;
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.recordsSignal.set(parsed as InventoryRecord[]);
        } else {
          this.recordsSignal.set(MOCK_INITIAL_INVENTORY);
          this.persistData(INVENTORY_STORAGE_KEY, MOCK_INITIAL_INVENTORY);
        }
      } else {
        this.recordsSignal.set(MOCK_INITIAL_INVENTORY);
        this.persistData(INVENTORY_STORAGE_KEY, MOCK_INITIAL_INVENTORY);
      }

      const rawHistory = localStorage.getItem(INVENTORY_HISTORY_KEY);
      if (rawHistory) {
        const parsedHist = JSON.parse(rawHistory) as unknown;
        if (Array.isArray(parsedHist)) {
          this.historySignal.set(parsedHist as StockHistoryItem[]);
        } else {
          this.historySignal.set(MOCK_INITIAL_HISTORY);
          this.persistData(INVENTORY_HISTORY_KEY, MOCK_INITIAL_HISTORY);
        }
      } else {
        this.historySignal.set(MOCK_INITIAL_HISTORY);
        this.persistData(INVENTORY_HISTORY_KEY, MOCK_INITIAL_HISTORY);
      }
    } catch {
      this.recordsSignal.set(MOCK_INITIAL_INVENTORY);
      this.historySignal.set(MOCK_INITIAL_HISTORY);
    }
  }

  private persistData(key: string, data: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch {
      // Swallowed
    }
  }
}
