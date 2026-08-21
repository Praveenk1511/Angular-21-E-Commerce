import { Directive, ElementRef, effect, inject, input, output } from '@angular/core';

/**
 * Drives a native `<dialog>` from a signal, and reports when it closes.
 *
 * Native `<dialog>` with `showModal()` is used deliberately in preference to a
 * hand-built overlay. The platform already provides, correctly and for free:
 *
 * - focus containment inside the dialog while it is open;
 * - focus restoration to the invoking element on close;
 * - Escape to dismiss;
 * - the top layer, so no `z-index` arms race with sticky headers;
 * - `aria-modal` semantics and inert background content.
 *
 * Re-implementing that list is where most custom modals leak keyboard focus.
 *
 * Shared by {@link Modal} and {@link Drawer} so the two differ only in presentation.
 */
@Directive({
  selector: 'dialog[appDialogHost]',
  host: {
    '(close)': 'onNativeClose()',
    '(click)': 'onClick($event)',
  },
})
export class DialogHost {
  readonly open = input.required<boolean>();

  /** Whether a click on the backdrop dismisses the dialog. */
  readonly closeOnBackdrop = input(true);

  /** Emitted whenever the dialog closes, by any route: Escape, backdrop or code. */
  readonly dialogClose = output<void>();

  private readonly dialog = inject<ElementRef<HTMLDialogElement>>(ElementRef).nativeElement;

  constructor() {
    effect(() => {
      const shouldBeOpen = this.open();

      // Guard both ways: showModal() on an open dialog throws, and close() on a
      // closed one would emit a spurious `close` event.
      if (shouldBeOpen && !this.dialog.open) {
        this.showModal();
      } else if (!shouldBeOpen && this.dialog.open) {
        this.requestClose();
      }
    });
  }

  protected onNativeClose(): void {
    this.dialogClose.emit();
  }

  /**
   * A click on the backdrop is reported with the dialog element itself as the
   * target, because the backdrop is a pseudo-element and cannot be hit directly.
   * Anything inside the dialog has a descendant as its target, so this comparison
   * is what separates "clicked outside" from "clicked the content".
   */
  protected onClick(event: MouseEvent): void {
    if (!this.closeOnBackdrop() || event.target !== this.dialog) {
      return;
    }

    this.requestClose();
  }

  /**
   * `showModal` is not universally present — it is absent from non-browser DOM
   * implementations, which includes server-side rendering and the jsdom test
   * environment. Calling it unguarded turns a missing API into a thrown error during
   * change detection.
   *
   * The fallback opens the dialog non-modally: still rendered and still dismissible,
   * but without the top layer, backdrop or focus containment the platform would
   * otherwise supply. Degraded rather than broken.
   */
  private showModal(): void {
    if (typeof this.dialog.showModal === 'function') {
      this.dialog.showModal();

      return;
    }

    this.dialog.open = true;
  }

  /** Close through the platform where possible, so `close` fires exactly once. */
  private requestClose(): void {
    if (typeof this.dialog.close === 'function') {
      this.dialog.close();

      return;
    }

    // No native close(), so the `close` event has to be raised by hand.
    this.dialog.open = false;
    this.dialogClose.emit();
  }
}
