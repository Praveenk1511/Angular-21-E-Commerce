import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';

import { uniqueId } from '@core/utils/unique-id';
import { IconButton } from '@shared/components/icon-button/icon-button';
import { Icon } from '@shared/components/icon/icon';
import { DialogHost } from '@shared/directives/dialog-host';

export type ModalSize = 'sm' | 'md' | 'lg';

/**
 * Centred modal dialog.
 *
 * `open` is a two-way `model`, so callers write `[(open)]="isOpen"` and the dialog
 * stays consistent however it was dismissed — Escape and backdrop clicks push the
 * state back rather than leaving the signal claiming it is still open.
 *
 * `heading` is required and wired through `aria-labelledby`, because an unnamed
 * dialog gives a screen reader nothing to announce on open.
 */
@Component({
  selector: 'app-modal',
  imports: [DialogHost, Icon, IconButton],
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Modal {
  readonly open = model.required<boolean>();
  readonly heading = input.required<string>();
  readonly size = input<ModalSize>('md');
  readonly closeOnBackdrop = input(true);

  /** Hide the built-in close button, for dialogs that require an explicit choice. */
  readonly dismissible = input(true);

  protected readonly headingId = uniqueId('modal-heading');
  protected readonly dialogClasses = computed(() => `modal modal--${this.size()}`);

  protected close(): void {
    this.open.set(false);
  }
}
