import type {
  FacetBucket,
  ProductFacets,
  ProductListResponse,
  ProductSortField,
  SortDirection,
} from '@core/models';
import type { ProductSeed } from '@mock-data/index';

import type { MockApiConfig } from '../mock-api.config';
import { type MockRoute, notFound, ok } from '../mock-api.types';
import {
  matchesText,
  paginate,
  readInt,
  readList,
  readPaging,
  readBool,
  sortBy,
} from '../mock-api.utils';
import {
  allProductSeeds,
  brandName,
  categoryIdsWithin,
  categoryName,
  findProductSeed,
  ratingFor,
  stockFor,
  toProduct,
  toProductSummary,
} from '../mock-db';

/** Filters extracted from the query string. Each key is independently omittable. */
interface ProductFilters {
  readonly q?: string;
  readonly categoryId?: string;
  readonly brandIds?: readonly string[];
  readonly minPriceMinor?: number;
  readonly maxPriceMinor?: number;
  readonly minRating?: number;
  readonly inStockOnly?: boolean;
  readonly onSaleOnly?: boolean;
  readonly tags?: readonly string[];
}

/*
 * Plain arrays rather than `Set`s. Both lists are three entries long, so lookup cost is
 * irrelevant, and a top-level `new Set(...)` is an executable statement that would keep
 * this module (and the seed data it reaches) in the bundle when the mock is disabled.
 */

/** Statuses a customer can actually buy today. */
const PURCHASABLE: readonly string[] = ['in-stock', 'low-stock', 'preorder'];

/** Sort fields whose natural reading order is descending. */
const DESCENDING_BY_DEFAULT: readonly ProductSortField[] = ['rating', 'newest', 'relevance'];

export function createProductRoutes(config: MockApiConfig): readonly MockRoute[] {
  return [
    {
      method: 'GET',
      path: '/products',
      handle: ({ query }) => {
        const { page, pageSize } = readPaging(query, config.defaultPageSize, config.maxPageSize);
        const filters = readFilters(query);
        const sort = readSort(query['sort']);
        const direction = readDirection(query['direction'], sort);

        const matched = applyFilters(allProductSeeds(), filters);
        const ordered = applySort(matched, sort, direction, filters.q);
        const pageResult = paginate(ordered.map(toProductSummary), page, pageSize);

        const response: ProductListResponse = {
          ...pageResult,
          facets: buildFacets(filters),
        };

        return ok(response);
      },
    },

    {
      method: 'GET',
      path: '/products/:idOrSlug',
      handle: ({ params }) => {
        const idOrSlug = params['idOrSlug'] ?? '';
        const seed = findProductSeed(idOrSlug);

        if (!seed) {
          throw notFound(`No product matches "${idOrSlug}".`);
        }

        return ok(toProduct(seed));
      },
    },

    {
      method: 'GET',
      path: '/products/:idOrSlug/related',
      handle: ({ params }) => {
        const idOrSlug = params['idOrSlug'] ?? '';
        const seed = findProductSeed(idOrSlug);

        if (!seed) {
          throw notFound(`No product matches "${idOrSlug}".`);
        }

        const related = toProduct(seed)
          .relatedProductIds.map((id) => findProductSeed(id))
          .filter((candidate): candidate is ProductSeed => candidate !== undefined)
          .map(toProductSummary);

        return ok(related);
      },
    },
  ];
}

/**
 * Extract filters from the query string.
 *
 * Values are read into locals first so each one narrows to a defined type before being
 * spread. Under `exactOptionalPropertyTypes` an optional property cannot accept
 * `undefined`, so an absent filter has to be an absent *key* — which is also what makes
 * `omit()` work correctly when building facets.
 */
function readFilters(query: Readonly<Record<string, string>>): ProductFilters {
  const rawBrands = query['brandIds'] || query['brand'];
  const brandIds = readList(rawBrands);
  const tags = readList(query['tags']);
  const q = query['q'];
  const categoryId = query['categoryId'] || query['category'];
  const minPriceMinor = readInt(query['minPriceMinor'] || query['minPrice']);
  const maxPriceMinor = readInt(query['maxPriceMinor'] || query['maxPrice']);
  const minRating = readInt(query['minRating'] || query['rating']);
  const inStockOnly = readBool(query['inStockOnly']) ?? readBool(query['inStock']);
  const onSaleOnly = readBool(query['onSaleOnly']) ?? readBool(query['onSale']);

  return {
    ...(q ? { q } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(brandIds.length > 0 ? { brandIds } : {}),
    ...(minPriceMinor === undefined ? {} : { minPriceMinor }),
    ...(maxPriceMinor === undefined ? {} : { maxPriceMinor }),
    ...(minRating === undefined ? {} : { minRating }),
    ...(inStockOnly === undefined ? {} : { inStockOnly }),
    ...(onSaleOnly === undefined ? {} : { onSaleOnly }),
    ...(tags.length > 0 ? { tags } : {}),
  };
}

function readSort(value: string | undefined): ProductSortField {
  const allowed: readonly ProductSortField[] = ['relevance', 'price', 'rating', 'newest', 'name'];

  return allowed.find((field) => field === value) ?? 'relevance';
}

function readDirection(value: string | undefined, sort: ProductSortField): SortDirection {
  if (value === 'asc' || value === 'desc') {
    return value;
  }

  return DESCENDING_BY_DEFAULT.includes(sort) ? 'desc' : 'asc';
}

function applyFilters(
  seeds: readonly ProductSeed[],
  filters: ProductFilters,
): readonly ProductSeed[] {
  // A parent category includes everything beneath it, which is what a shopper expects
  // when they click "Audio" rather than a specific subcategory.
  const categoryIds = filters.categoryId ? new Set(categoryIdsWithin(filters.categoryId)) : null;
  const brandIds = filters.brandIds ? new Set(filters.brandIds) : null;

  return seeds.filter((seed) => {
    if (categoryIds && !categoryIds.has(seed.categoryId)) {
      return false;
    }

    if (brandIds && !brandIds.has(seed.brandId)) {
      return false;
    }

    if (filters.minPriceMinor !== undefined && seed.priceMinor < filters.minPriceMinor) {
      return false;
    }

    if (filters.maxPriceMinor !== undefined && seed.priceMinor > filters.maxPriceMinor) {
      return false;
    }

    if (filters.minRating !== undefined && ratingFor(seed).average < filters.minRating) {
      return false;
    }

    if (filters.inStockOnly === true && !PURCHASABLE.includes(stockFor(seed).status)) {
      return false;
    }

    if (
      filters.onSaleOnly === true &&
      (seed.compareAtMinor === undefined || seed.compareAtMinor <= seed.priceMinor)
    ) {
      return false;
    }

    // Tags are an OR: any match keeps the product, which is how tag chips behave.
    if (filters.tags && !filters.tags.some((tag) => seed.tags.includes(tag))) {
      return false;
    }

    if (filters.q !== undefined) {
      return matchesText(
        [seed.name, seed.summary, seed.sku, brandName(seed.brandId), seed.tags.join(' ')],
        filters.q,
      );
    }

    return true;
  });
}

function applySort(
  seeds: readonly ProductSeed[],
  sort: ProductSortField,
  direction: SortDirection,
  searchTerm: string | undefined,
): readonly ProductSeed[] {
  switch (sort) {
    case 'price':
      return sortBy(seeds, (seed) => seed.priceMinor, direction);

    case 'rating':
      return sortBy(seeds, (seed) => ratingFor(seed).average, direction);

    case 'newest':
      return sortBy(seeds, (seed) => Date.parse(seed.createdAt), direction);

    case 'name':
      return sortBy(seeds, (seed) => seed.name, direction);

    case 'relevance':
    default:
      return sortByRelevance(seeds, direction, searchTerm);
  }
}

/**
 * Relevance ordering.
 *
 * With a search term, a name match outranks a match found only in the summary or tags,
 * because a shopper searching "kettle" expects the kettle first. Without a term there
 * is nothing to be relevant to, so featured items lead and rating breaks the tie.
 */
function sortByRelevance(
  seeds: readonly ProductSeed[],
  direction: SortDirection,
  searchTerm: string | undefined,
): readonly ProductSeed[] {
  const score = (seed: ProductSeed): number => {
    const rating = ratingFor(seed).average;

    if (searchTerm === undefined) {
      return (seed.isFeatured ? 100 : 0) + rating;
    }

    const nameHit = matchesText([seed.name], searchTerm) ? 100 : 0;
    const brandHit = matchesText([brandName(seed.brandId)], searchTerm) ? 50 : 0;

    return nameHit + brandHit + rating;
  };

  return sortBy(seeds, score, direction);
}

/**
 * Facet counts.
 *
 * Each facet is counted against the query with *its own* filter removed. Counting with
 * every filter applied is the common mistake: it makes already-selected options read
 * as the only choice and shows zero for every alternative, so a shopper cannot tell
 * what widening the filter would give them.
 */
function buildFacets(filters: ProductFilters): ProductFacets {
  const all = allProductSeeds();

  // Each facet's own dimension is pulled out, then recombined into the other two, so
  // what every count deliberately ignores is visible rather than hidden in a helper.
  const { brandIds, categoryId, minPriceMinor, maxPriceMinor, ...shared } = filters;

  const brand = brandIds === undefined ? {} : { brandIds };
  const category = categoryId === undefined ? {} : { categoryId };
  const price = {
    ...(minPriceMinor === undefined ? {} : { minPriceMinor }),
    ...(maxPriceMinor === undefined ? {} : { maxPriceMinor }),
  };

  const withoutBrand = applyFilters(all, { ...shared, ...category, ...price });
  const withoutCategory = applyFilters(all, { ...shared, ...brand, ...price });
  const withoutPrice = applyFilters(all, { ...shared, ...brand, ...category });

  return {
    brands: countBy(withoutBrand, (seed) => seed.brandId, brandName),
    categories: countBy(withoutCategory, (seed) => seed.categoryId, categoryName),
    priceRange: {
      minMinor: withoutPrice.reduce(
        (lowest, seed) => Math.min(lowest, seed.priceMinor),
        Number.POSITIVE_INFINITY,
      ),
      maxMinor: withoutPrice.reduce((highest, seed) => Math.max(highest, seed.priceMinor), 0),
    },
  };
}

function countBy(
  seeds: readonly ProductSeed[],
  select: (seed: ProductSeed) => string,
  label: (id: string) => string,
): readonly FacetBucket[] {
  const counts = new Map<string, number>();

  for (const seed of seeds) {
    const key = select(seed);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([id, count]) => ({ id, label: label(id), count }))
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label));
}
