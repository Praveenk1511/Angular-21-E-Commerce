import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { Icon } from '@shared/components/icon/icon';

/** A rendered slot: either a page to jump to, or a gap. */
type PageSlot = { readonly kind: 'page'; readonly page: number } | { readonly kind: 'gap' };

/**
 * Page navigation.
 *
 * Pure presentation: it reports the page the user asked for and never fetches
 * anything. It also does not clamp silently — asking for page 7 of 3 is a caller bug,
 * and `totalPages` is what bounds the rendered window.
 *
 * Marked up as a `nav` with a list, current page carrying `aria-current="page"`, and
 * gaps as `aria-hidden` text so the ellipsis is not announced as content.
 */
@Component({
  selector: 'app-pagination',
  imports: [Icon],
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pagination {
  /** Current page, one-based to match what the user is shown. */
  readonly page = input.required<number>();
  readonly totalPages = input.required<number>();

  /** Pages to keep either side of the current one before collapsing to a gap. */
  readonly siblingCount = input(1);

  readonly label = input('Pagination');

  readonly pageChange = output<number>();

  protected readonly hasPrevious = computed(() => this.page() > 1);
  protected readonly hasNext = computed(() => this.page() < this.totalPages());

  /**
   * Window of pages to render: first and last are always reachable, the current page
   * keeps `siblingCount` neighbours, and everything else collapses into gaps.
   */
  protected readonly slots = computed<readonly PageSlot[]>(() => {
    const total = this.totalPages();
    const current = this.page();
    const siblings = Math.max(0, this.siblingCount());

    if (total <= 0) {
      return [];
    }

    const shouldRender = (candidate: number): boolean =>
      candidate === 1 || candidate === total || Math.abs(candidate - current) <= siblings;

    const result: PageSlot[] = [];
    let gapOpen = false;

    for (let candidate = 1; candidate <= total; candidate++) {
      if (shouldRender(candidate)) {
        result.push({ kind: 'page', page: candidate });
        gapOpen = false;
      } else if (!gapOpen) {
        // Collapse each run of hidden pages into a single gap.
        result.push({ kind: 'gap' });
        gapOpen = true;
      }
    }

    return result;
  });

  protected isCurrent(page: number): boolean {
    return page === this.page();
  }

  protected goTo(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.page()) {
      return;
    }

    this.pageChange.emit(page);
  }
}
