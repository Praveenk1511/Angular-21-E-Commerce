import type { StockStatus } from './product.model';

/**
 * Stock position for one product at one location.
 *
 * `onHand` is physical stock; `reserved` is committed to unfulfilled orders. What a
 * customer may buy is the difference, which is why availability is calculated rather
 * than stored — a single `quantity` field is how a warehouse and a storefront end up
 * disagreeing.
 */
export interface InventoryRecord {
  readonly productId: string;
  readonly productName: string;
  readonly sku: string;
  readonly warehouseCode: string;
  readonly onHand: number;
  readonly reserved: number;
  readonly available: number;
  /** Level at which the product should be reordered. */
  readonly reorderLevel: number;
  readonly reorderQuantity: number;
  readonly status: StockStatus;
  /** ISO 8601 of the last stock movement. */
  readonly updatedAt: string;
  /** ISO 8601 date the next delivery is expected, or `null`. */
  readonly incomingAt: string | null;
  readonly incomingQuantity: number;
}

export interface InventoryListQuery {
  readonly page?: number;
  readonly pageSize?: number;
  /** Matches product name or SKU. */
  readonly q?: string;
  readonly warehouseCode?: string;
  /** Restrict to records at or below their reorder level. */
  readonly lowStockOnly?: boolean;
}
