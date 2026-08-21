import type {
  Address,
  Brand,
  Category,
  CategoryTreeNode,
  InventoryRecord,
  Order,
  OrderLine,
  OrderSummary,
  OrderTotals,
  Product,
  ProductBadge,
  ProductImage,
  ProductSummary,
  RatingSummary,
  StockInfo,
  StockStatus,
} from '@core/models';
import {
  ADDRESS_SEEDS,
  BRAND_SEEDS,
  CATEGORY_SEEDS,
  INVENTORY_SEEDS,
  PRODUCT_SEEDS,
  type CategorySeed,
  type InventorySeed,
  type OrderSeed,
  type ProductSeed,
  ORDER_SEEDS,
} from '@mock-data/index';

import { roundMinor } from './mock-api.utils';

/** Store currency. A multi-currency catalogue is out of scope for the mock. */
const CURRENCY = 'GBP' as const;

/** UK retail prices include VAT at 20%, so tax is 1/6 of the gross total. */
const VAT_DIVISOR = 6;

/** How recently a product must have been added to earn the "new" badge. */
const NEW_PRODUCT_DAYS = 120;

/** Review count above which a product is treated as a bestseller. */
const BESTSELLER_REVIEW_COUNT = 150;

interface SeedIndex {
  readonly productsById: ReadonlyMap<string, ProductSeed>;
  readonly productsBySlug: ReadonlyMap<string, ProductSeed>;
  readonly inventoryByProductId: ReadonlyMap<string, InventorySeed>;
  readonly addressesById: ReadonlyMap<string, Address>;
  readonly categoriesById: ReadonlyMap<string, CategorySeed>;
}

let seedIndex: SeedIndex | null = null;

/**
 * Lookup indexes, built on first use.
 *
 * Deliberately not module-level `const`s. A top-level `new Map(...)` is an observable
 * side effect to the bundler, which would pin this module — and through it every seed
 * file — into the bundle even when `ngUseMockApi` is false and nothing references it.
 * Keeping the top level free of executable statements is what allows the entire mock
 * backend to be eliminated rather than shipped unreachable.
 */
function seeds(): SeedIndex {
  const existing = seedIndex;

  if (existing) {
    return existing;
  }

  const built: SeedIndex = {
    productsById: new Map(PRODUCT_SEEDS.map((seed) => [seed.id, seed])),
    productsBySlug: new Map(PRODUCT_SEEDS.map((seed) => [seed.slug, seed])),
    inventoryByProductId: new Map(INVENTORY_SEEDS.map((seed) => [seed.productId, seed])),
    addressesById: new Map(ADDRESS_SEEDS.map((address) => [address.id, address])),
    categoriesById: new Map(CATEGORY_SEEDS.map((category) => [category.id, category])),
  };

  seedIndex = built;

  return built;
}

/**
 * Derived read model over the seed data.
 *
 * This is the layer a real backend's query and serialisation code would occupy. It
 * exists so that every derived value — availability, rating aggregates, order totals —
 * is computed in exactly one place, and so the seeds stay normalised instead of
 * carrying pre-baked answers that can fall out of step.
 *
 * Nothing here mutates the seeds. Requests are read-only apart from the two endpoints
 * that accept writes, which keep their changes in module-level state alongside.
 */

// ============================================================================
// Products
// ============================================================================

export function allProductSeeds(): readonly ProductSeed[] {
  return PRODUCT_SEEDS;
}

export function findProductSeed(idOrSlug: string): ProductSeed | undefined {
  return seeds().productsById.get(idOrSlug) ?? seeds().productsBySlug.get(idOrSlug);
}

/**
 * Rating aggregate, computed from the histogram.
 *
 * Deriving the average from the distribution rather than storing both means the stars
 * and the breakdown bars can never disagree.
 */
export function ratingFor(seed: ProductSeed): RatingSummary {
  const distribution = seed.ratingDistribution;
  const count = distribution.reduce((total, entry) => total + entry, 0);

  if (count === 0) {
    return { average: 0, count: 0, distribution };
  }

  const weighted = distribution.reduce((total, entry, index) => total + entry * (index + 1), 0);

  return {
    average: Math.round((weighted / count) * 10) / 10,
    count,
    distribution,
  };
}

/**
 * Availability, from lifecycle and inventory together.
 *
 * Lifecycle wins where it is decisive: a discontinued product is not "in stock" just
 * because a few units remain in a warehouse, and a preorder is not "out of stock"
 * merely because none have arrived yet.
 */
export function stockFor(seed: ProductSeed): StockInfo {
  const record = seeds().inventoryByProductId.get(seed.id);
  const available = record ? Math.max(0, record.onHand - record.reserved) : 0;

  if (seed.lifecycle === 'discontinued') {
    return { status: available > 0 ? 'low-stock' : 'discontinued', available };
  }

  if (seed.lifecycle === 'preorder') {
    return { status: 'preorder', available };
  }

  return { status: deriveStatus(available, record?.reorderLevel ?? 0), available };
}

function deriveStatus(available: number, reorderLevel: number): StockStatus {
  if (available <= 0) {
    return 'out-of-stock';
  }

  return available <= reorderLevel ? 'low-stock' : 'in-stock';
}

/** Image URLs are generated from the slug; binary assets are not part of the mock. */
function imagesFor(seed: ProductSeed): readonly ProductImage[] {
  return [
    { url: `/images/products/${seed.slug}-front.webp`, alt: `${seed.name}, front view` },
    { url: `/images/products/${seed.slug}-angle.webp`, alt: `${seed.name}, three-quarter view` },
    { url: `/images/products/${seed.slug}-detail.webp`, alt: `${seed.name}, close detail` },
  ];
}

function badgesFor(
  seed: ProductSeed,
  rating: RatingSummary,
  stock: StockInfo,
): readonly ProductBadge[] {
  const badges: ProductBadge[] = [];
  const ageDays = (Date.now() - Date.parse(seed.createdAt)) / 86_400_000;

  if (ageDays <= NEW_PRODUCT_DAYS) {
    badges.push('new');
  }

  if (seed.compareAtMinor !== undefined) {
    badges.push('sale');
  }

  if (rating.count >= BESTSELLER_REVIEW_COUNT) {
    badges.push('bestseller');
  }

  if (stock.status === 'low-stock') {
    badges.push('low-stock');
  }

  return badges;
}

export function toProductSummary(seed: ProductSeed): ProductSummary {
  const rating = ratingFor(seed);
  const stock = stockFor(seed);
  const [thumbnail] = imagesFor(seed);

  return {
    id: seed.id,
    slug: seed.slug,
    name: seed.name,
    brandId: seed.brandId,
    categoryId: seed.categoryId,
    summary: seed.summary,
    price: {
      currency: CURRENCY,
      amountMinor: seed.priceMinor,
      ...(seed.compareAtMinor === undefined ? {} : { compareAtMinor: seed.compareAtMinor }),
    },
    thumbnail: thumbnail ?? { url: '', alt: seed.name },
    rating,
    stock,
    badges: badgesFor(seed, rating, stock),
    createdAt: seed.createdAt,
  };
}

export function toProduct(seed: ProductSeed): Product {
  return {
    ...toProductSummary(seed),
    sku: seed.sku,
    description: seed.description,
    images: imagesFor(seed),
    specifications: seed.specifications,
    tags: seed.tags,
    lifecycle: seed.lifecycle,
    weightGrams: seed.weightGrams,
    warrantyMonths: seed.warrantyMonths,
    relatedProductIds: relatedProductIds(seed),
  };
}

/**
 * Related products: same category, best rated first.
 *
 * Derived rather than curated in the seed, because a hand-maintained list of related
 * ids goes stale the moment a product is added or removed.
 */
function relatedProductIds(seed: ProductSeed): readonly string[] {
  return PRODUCT_SEEDS.filter(
    (candidate) => candidate.categoryId === seed.categoryId && candidate.id !== seed.id,
  )
    .map((candidate) => ({ id: candidate.id, rating: ratingFor(candidate).average }))
    .sort((left, right) => right.rating - left.rating)
    .slice(0, 4)
    .map((entry) => entry.id);
}

// ============================================================================
// Categories and brands
// ============================================================================

export function allCategories(): readonly Category[] {
  return CATEGORY_SEEDS.map((seed) => ({
    ...seed,
    productCount: PRODUCT_SEEDS.filter((product) => product.categoryId === seed.id).length,
  }));
}

export function findCategory(idOrSlug: string): Category | undefined {
  return allCategories().find((category) => category.id === idOrSlug || category.slug === idOrSlug);
}

/** Assemble the category tree, with counts that include descendants. */
export function categoryTree(): readonly CategoryTreeNode[] {
  const flat = allCategories();

  const build = (parentId: string | null): readonly CategoryTreeNode[] =>
    flat
      .filter((category) => category.parentId === parentId)
      .sort((left, right) => left.position - right.position)
      .map((category) => {
        const children = build(category.id);

        return {
          ...category,
          children,
          totalProductCount:
            category.productCount +
            children.reduce((total, child) => total + child.totalProductCount, 0),
        };
      });

  return build(null);
}

/** Every category id in a subtree, so filtering by a parent includes its children. */
export function categoryIdsWithin(categoryId: string): readonly string[] {
  const collect = (id: string): readonly string[] => [
    id,
    ...CATEGORY_SEEDS.filter((category) => category.parentId === id).flatMap((child) =>
      collect(child.id),
    ),
  ];

  return collect(categoryId);
}

export function categoryName(categoryId: string): string {
  return seeds().categoriesById.get(categoryId)?.name ?? categoryId;
}

export function allBrands(): readonly Brand[] {
  return BRAND_SEEDS.map((seed) => ({
    ...seed,
    productCount: PRODUCT_SEEDS.filter((product) => product.brandId === seed.id).length,
  }));
}

export function findBrand(idOrSlug: string): Brand | undefined {
  return allBrands().find((brand) => brand.id === idOrSlug || brand.slug === idOrSlug);
}

export function brandName(brandId: string): string {
  return BRAND_SEEDS.find((brand) => brand.id === brandId)?.name ?? brandId;
}

// ============================================================================
// Inventory
// ============================================================================

export function allInventoryRecords(): readonly InventoryRecord[] {
  return INVENTORY_SEEDS.map(toInventoryRecord).filter(
    (record): record is InventoryRecord => record !== null,
  );
}

export function findInventoryRecord(productId: string): InventoryRecord | undefined {
  const seed = seeds().inventoryByProductId.get(productId);

  return seed ? (toInventoryRecord(seed) ?? undefined) : undefined;
}

function toInventoryRecord(seed: InventorySeed): InventoryRecord | null {
  const product = seeds().productsById.get(seed.productId);

  if (!product) {
    return null;
  }

  const available = Math.max(0, seed.onHand - seed.reserved);

  return {
    productId: seed.productId,
    productName: product.name,
    sku: product.sku,
    warehouseCode: seed.warehouseCode,
    onHand: seed.onHand,
    reserved: seed.reserved,
    available,
    reorderLevel: seed.reorderLevel,
    reorderQuantity: seed.reorderQuantity,
    status: stockFor(product).status,
    updatedAt: seed.updatedAt,
    incomingAt: seed.incomingAt,
    incomingQuantity: seed.incomingQuantity,
  };
}

// ============================================================================
// Addresses
// ============================================================================

export function addressesForUser(userId: string): readonly Address[] {
  return ADDRESS_SEEDS.filter((address) => address.userId === userId);
}

export function findAddress(addressId: string): Address | undefined {
  return seeds().addressesById.get(addressId);
}

// ============================================================================
// Orders
// ============================================================================

export function allOrderSeeds(): readonly OrderSeed[] {
  return ORDER_SEEDS;
}

export function findOrderSeed(idOrReference: string): OrderSeed | undefined {
  return ORDER_SEEDS.find(
    (order) => order.id === idOrReference || order.reference === idOrReference,
  );
}

function toOrderLines(seed: OrderSeed): readonly OrderLine[] {
  return seed.lines.map((line, index) => {
    const product = seeds().productsById.get(line.productId);

    return {
      id: `${seed.id}-L${index + 1}`,
      productId: line.productId,
      // Falls back rather than throwing: an order referencing a delisted product is a
      // real situation, and a historical record should still be readable.
      productName: product?.name ?? 'Unavailable product',
      productSlug: product?.slug ?? '',
      sku: product?.sku ?? '',
      quantity: line.quantity,
      unitPrice: { currency: CURRENCY, amountMinor: line.unitPriceMinor },
      lineTotalMinor: roundMinor(line.unitPriceMinor * line.quantity),
    };
  });
}

/** Every total is computed, so a fixture can never ship arithmetic that does not add up. */
function toOrderTotals(seed: OrderSeed, lines: readonly OrderLine[]): OrderTotals {
  const subtotalMinor = lines.reduce((total, line) => total + line.lineTotalMinor, 0);
  const grandTotalMinor = Math.max(0, subtotalMinor - seed.discountMinor + seed.shippingMinor);

  return {
    currency: CURRENCY,
    subtotalMinor,
    discountMinor: seed.discountMinor,
    shippingMinor: seed.shippingMinor,
    taxMinor: roundMinor(grandTotalMinor / VAT_DIVISOR),
    grandTotalMinor,
  };
}

export function toOrderSummary(seed: OrderSeed): OrderSummary {
  const lines = toOrderLines(seed);

  return {
    id: seed.id,
    reference: seed.reference,
    userId: seed.userId,
    status: seed.status,
    placedAt: seed.placedAt,
    itemCount: lines.reduce((total, line) => total + line.quantity, 0),
    totals: toOrderTotals(seed, lines),
  };
}

export function toOrder(seed: OrderSeed): Order {
  const lines = toOrderLines(seed);
  const shippingAddress = findAddress(seed.shippingAddressId);
  const billingAddress = findAddress(seed.billingAddressId);

  if (!shippingAddress || !billingAddress) {
    throw new Error(`Order ${seed.id} references an address that does not exist.`);
  }

  return {
    ...toOrderSummary(seed),
    lines,
    shippingAddress,
    billingAddress,
    payment: seed.payment,
    shipping: seed.shipping,
    couponCode: seed.couponCode,
    customerNote: seed.customerNote,
    timeline: seed.timeline,
  };
}
