import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Icon } from '@shared/components/icon/icon';

/** One step in a breadcrumb trail. The final step has no `url`. */
export interface BreadcrumbItem {
  readonly label: string;
  readonly url?: string;
}

/**
 * Hierarchical trail showing where the current page sits.
 *
 * Presentational: it renders the trail it is handed. Deriving a trail from the
 * activated route is the caller's job — route metadata already carries `breadcrumb`
 * labels for exactly that, and building the trail in here would couple the design
 * system to the router's shape.
 *
 * An ordered list inside a labelled `nav`, since the sequence is meaningful. The last
 * item is plain text with `aria-current="page"`, never a link — linking to the page
 * you are already on is noise for keyboard and screen reader users.
 */
@Component({
  selector: 'app-breadcrumb',
  imports: [RouterLink, Icon],
  templateUrl: './breadcrumb.html',
  styleUrl: './breadcrumb.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Breadcrumb {
  readonly items = input.required<readonly BreadcrumbItem[]>();
  readonly label = input('Breadcrumb');

  protected readonly lastIndex = computed(() => this.items().length - 1);

  protected isLast(index: number): boolean {
    return index === this.lastIndex();
  }
}
