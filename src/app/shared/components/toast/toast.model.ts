export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

/** A toast request, as supplied by a caller. */
export interface ToastOptions {
  readonly variant?: ToastVariant;

  /** Short summary. This is what gets announced first. */
  readonly title: string;

  readonly message?: string;

  /**
   * Milliseconds before auto-dismissal. `0` keeps the toast until dismissed by hand.
   *
   * Anything time-limited is in tension with WCAG 2.2.1, so errors default to sticky
   * and every toast carries a close button regardless.
   */
  readonly duration?: number;
}

/** A toast currently on screen. */
export interface Toast extends ToastOptions {
  readonly id: number;
  readonly variant: ToastVariant;
  readonly duration: number;
}
