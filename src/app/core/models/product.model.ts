import type { Page, SortDirection } from './api.model';

export type CurrencyCode = 'INR' | 'GBP' | 'EUR' | 'USD';

/**
 * A monetary amount.
 *
 * Held as integer minor units (pence, cents) rather than a decimal, because binary
 * floating point cannot represent most decimal money values exactly and the errors
 * compound once you start summing order lines. Formatting for display is a
 * presentation concern and happens at the edge.
 */
export interface Price {
  readonly currency: CurrencyCode;
  readonly amountMinor: number;
  /** Original price, present only when the item is reduced. */
  readonly compareAtMinor?: number;
}

export interface ProductImage {
  readonly url: string;
  /** Describes the image for screen readers; never a repeat of the product name. */
  readonly alt: string;
}

export interface ProductSpecification {
  readonly label: string;
  readonly value: string;
}

/**
 * Cached review aggregate.
 *
 * Denormalised onto the product exactly as a real catalogue service would, so a
 * product grid does not need to join the reviews collection to draw stars.
 */
export interface RatingSummary {
  /** Mean score from 0 to 5, to one decimal place. */
  readonly average: number;
  readonly count: number;
  /** Number of reviews at each score, indexed 1 star through 5 stars. */
  readonly distribution: readonly [number, number, number, number, number];
}

/** Where a product sits in its commercial life, independent of stock on hand. */
export type ProductLifecycle = 'active' | 'preorder' | 'discontinued';

/**
 * Availability as presented to a shopper.
 *
 * Derived by the API from lifecycle plus inventory, never stored on the product —
 * two sources of truth for "can I buy this" is how oversells happen.
 */
export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock' | 'preorder' | 'discontinued';

export interface StockInfo {
  readonly status: StockStatus;
  /** Units a customer could buy right now. */
  readonly available: number;
}

export type ProductBadge = 'new' | 'sale' | 'bestseller' | 'low-stock';

/** Product shape returned by list endpoints: enough to render a card, no more. */
export interface ProductSummary {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly brandId: string;
  readonly categoryId: string;
  readonly summary: string;
  readonly price: Price;
  readonly thumbnail: ProductImage;
  readonly rating: RatingSummary;
  readonly stock: StockInfo;
  readonly badges: readonly ProductBadge[];
  /** ISO 8601 timestamp. */
  readonly createdAt: string;
}

/** Full product resource, returned when a single product is requested. */
export interface Product extends ProductSummary {
  readonly sku: string;
  readonly description: string;
  readonly images: readonly ProductImage[];
  readonly specifications: readonly ProductSpecification[];
  readonly tags: readonly string[];
  readonly lifecycle: ProductLifecycle;
  readonly weightGrams: number;
  readonly warrantyMonths: number;
  readonly relatedProductIds: readonly string[];
}

export type ProductSortField = 'relevance' | 'price' | 'rating' | 'newest' | 'name';

/** Query accepted by the product list endpoint. */
export interface ProductListQuery {
  readonly page?: number;
  readonly pageSize?: number;
  /** Free-text search across name, summary, brand and tags. */
  readonly q?: string;
  readonly categoryId?: string;
  readonly brandIds?: readonly string[];
  readonly minPriceMinor?: number;
  readonly maxPriceMinor?: number;
  readonly minRating?: number;
  /** Restrict to items a customer can actually buy today. */
  readonly inStockOnly?: boolean;
  readonly onSaleOnly?: boolean;
  readonly tags?: readonly string[];
  readonly sort?: ProductSortField;
  readonly direction?: SortDirection;
}

/** One filter option with the number of matches behind it. */
export interface FacetBucket {
  readonly id: string;
  readonly label: string;
  readonly count: number;
}

/**
 * Filter options for the current result set.
 *
 * Counts are computed against the query with that facet's own filter removed, which
 * is what stops a filter UI from offering options that lead to no results.
 */
export interface ProductFacets {
  readonly brands: readonly FacetBucket[];
  readonly categories: readonly FacetBucket[];
  readonly priceRange: { readonly minMinor: number; readonly maxMinor: number };
}

export interface ProductListResponse extends Page<ProductSummary> {
  readonly facets: ProductFacets;
}
