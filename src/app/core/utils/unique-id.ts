let counter = 0;

/**
 * Generate a DOM id that is unique within the document.
 *
 * Accessible markup constantly needs ids to wire `label[for]`, `aria-controls`
 * and `aria-describedby` together. Components that can be instantiated more than
 * once cannot hard-code those ids, so they mint one at construction time.
 *
 * @example
 * private readonly inputId = uniqueId('site-search');  // 'site-search-1'
 */
export function uniqueId(prefix: string): string {
  counter += 1;

  return `${prefix}-${counter}`;
}
