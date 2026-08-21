import type { Page, PageMeta, SortDirection } from '@core/models';

import { badRequest } from './mock-api.types';

/** Parse an integer query value, returning `undefined` when absent or malformed. */
export function readInt(value: string | undefined): number | undefined {
  if (value === undefined || value.trim() === '') {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);

  return Number.isNaN(parsed) ? undefined : parsed;
}

/** Parse a boolean query value. Accepts `true`/`false` and `1`/`0`. */
export function readBool(value: string | undefined): boolean | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === 'true' || value === '1') {
    return true;
  }

  if (value === 'false' || value === '0') {
    return false;
  }

  return undefined;
}

/** Split a comma-separated query value into a list, dropping blanks. */
export function readList(value: string | undefined): readonly string[] {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

/**
 * Resolve paging from the query, clamped to sane bounds.
 *
 * A malformed `page` is rejected rather than silently coerced: quietly turning
 * `page=abc` into page 1 hides a broken caller.
 */
export function readPaging(
  query: Readonly<Record<string, string>>,
  defaultPageSize: number,
  maxPageSize: number,
): { page: number; pageSize: number } {
  const rawPage = query['page'];
  const rawPageSize = query['pageSize'];

  if (rawPage !== undefined && readInt(rawPage) === undefined) {
    throw badRequest(`Invalid page value: "${rawPage}".`);
  }

  if (rawPageSize !== undefined && readInt(rawPageSize) === undefined) {
    throw badRequest(`Invalid pageSize value: "${rawPageSize}".`);
  }

  const page = Math.max(1, readInt(rawPage) ?? 1);
  const pageSize = Math.min(Math.max(1, readInt(rawPageSize) ?? defaultPageSize), maxPageSize);

  return { page, pageSize };
}

/** Slice a filtered, sorted collection into a page and build its metadata. */
export function paginate<T>(items: readonly T[], page: number, pageSize: number): Page<T> {
  const totalItems = items.length;
  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / pageSize);
  const start = (page - 1) * pageSize;

  const meta: PageMeta = {
    page,
    pageSize,
    totalItems,
    totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
  };

  return { items: items.slice(start, start + pageSize), meta };
}

/** An empty page, used to serve the `scenario=empty` override. */
export function emptyPage<T>(page: number, pageSize: number): Page<T> {
  return {
    items: [],
    meta: {
      page,
      pageSize,
      totalItems: 0,
      totalPages: 0,
      hasPreviousPage: false,
      hasNextPage: false,
    },
  };
}

/**
 * Sort a copy of the list by a projected key.
 *
 * Copies first because callers pass module-level seed arrays, and sorting those in
 * place would permanently reorder the fixture for every later request.
 */
export function sortBy<T>(
  items: readonly T[],
  select: (item: T) => string | number,
  direction: SortDirection,
): readonly T[] {
  const factor = direction === 'desc' ? -1 : 1;

  return [...items].sort((left, right) => {
    const a = select(left);
    const b = select(right);

    if (typeof a === 'string' && typeof b === 'string') {
      return a.localeCompare(b) * factor;
    }

    return (Number(a) - Number(b)) * factor;
  });
}

/** Case- and accent-insensitive substring match, for free-text search. */
export function matchesText(haystack: readonly string[], needle: string): boolean {
  const term = normalise(needle);

  if (term === '') {
    return true;
  }

  return haystack.some((field) => normalise(field).includes(term));
}

function normalise(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/** Round to a whole number of minor units. Money must never carry a fraction. */
export function roundMinor(value: number): number {
  return Math.round(value);
}

/** Signed percentage change, to one decimal. `null` when the baseline was zero. */
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) {
    return null;
  }

  return Math.round(((current - previous) / previous) * 1000) / 10;
}

/** Latency for a request, drawn uniformly from the configured window. */
export function randomLatency(minMs: number, maxMs: number): number {
  return Math.round(minMs + Math.random() * Math.max(0, maxMs - minMs));
}
