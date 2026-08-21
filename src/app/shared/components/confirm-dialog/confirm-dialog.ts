import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';

import { Button } from '@shared/components/button/button';
import { Modal } from '@shared/components/modal/modal';

export type ConfirmTone = 'default' | 'danger';

/**
 * Yes/no confirmation, composed from {@link Modal}.
 *
 * Composition rather than a second dialog implementation, so focus handling and
 * dismissal behaviour cannot drift from the modal's.
 *
 * Two deliberate choices for destructive confirmations:
 *
 * - the backdrop does not dismiss, so a stray click cannot answer the question;
 * - initial focus lands on Cancel, so a reflexive Enter or Space is the safe answer
 *   rather than the destructive one. This is achieved by DOM order plus suppressing
 *   the modal's close button, not by an `autofocus` attribute.
 */
@Component({
  selector: 'app-confirm-dialog',
  imports: [Modal, Button],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialog {
  readonly open = model.required<boolean>();
  readonly heading = input.required<string>();
  readonly message = input<string | null>(null);
  readonly confirmLabel = input('Confirm');
  readonly cancelLabel = input('Cancel');
  readonly tone = input<ConfirmTone>('default');

  /** Shows a spinner on the confirm button while the caller's work is in flight. */
  readonly busy = input(false);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  protected readonly isDanger = computed(() => this.tone() === 'danger');
  protected readonly confirmVariant = computed(() => (this.isDanger() ? 'danger' : 'primary'));

  protected onConfirm(): void {
    this.confirmed.emit();
  }

  protected onCancel(): void {
    this.open.set(false);
    this.cancelled.emit();
  }

  /** Fires when the modal closes by Escape or backdrop, which counts as cancelling. */
  protected onOpenChange(next: boolean): void {
    this.open.set(next);

    if (!next) {
      this.cancelled.emit();
    }
  }
}
