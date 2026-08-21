import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';

import { uniqueId } from '@core/utils/unique-id';
import { IconButton } from '@shared/components/icon-button/icon-button';
import { Icon } from '@shared/components/icon/icon';
import { DialogHost } from '@shared/directives/dialog-host';

export type DrawerSide = 'start' | 'end';

/**
 * Edge-anchored panel.
 *
 * Shares {@link DialogHost} with {@link Modal}, so both get identical focus
 * containment, Escape handling and backdrop behaviour from the platform; the two
 * differ only in where the panel sits and how it is sized.
 *
 * `side` uses logical values so the panel follows the document's writing direction
 * instead of being pinned to physical left or right.
 */
@Component({
  selector: 'app-drawer',
  imports: [DialogHost, Icon, IconButton],
  templateUrl: './drawer.html',
  styleUrl: './drawer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Drawer {
  readonly open = model.required<boolean>();
  readonly heading = input.required<string>();
  readonly side = input<DrawerSide>('end');
  readonly closeOnBackdrop = input(true);

  protected readonly headingId = uniqueId('drawer-heading');
  protected readonly dialogClasses = computed(() => `drawer drawer--${this.side()}`);

  protected close(): void {
    this.open.set(false);
  }
}
