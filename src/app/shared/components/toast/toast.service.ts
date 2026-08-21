import { DestroyRef, Injectable, inject, signal } from '@angular/core';

import type { Toast, ToastOptions, ToastVariant } from './toast.model';

/** Auto-dismiss defaults per variant, in milliseconds. */
const DEFAULT_DURATION: Record<ToastVariant, number> = {
  success: 5000,
  info: 5000,
  warning: 8000,
  /* Errors stay until dismissed: a failure the user missed is a failure repeated. */
  error: 0,
};

/**
 * Queue of transient notifications.
 *
 * UI infrastructure, not business logic: it knows how to show and retire a message
 * and nothing about what any message means. Features call `show()`; nothing here
 * reaches for HTTP, routing or domain state.
 *
 * Provided at the root so any component can notify without threading a reference
 * through the tree, and rendered by exactly one {@link ToastContainer}.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly items = signal<readonly Toast[]>([]);

  /** Toasts currently on screen, oldest first. */
  readonly toasts = this.items.asReadonly();

  private nextId = 0;
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();

  constructor() {
    // Timers outlive change detection, so they need explicit teardown.
    inject(DestroyRef).onDestroy(() => {
      for (const timer of this.timers.values()) {
        clearTimeout(timer);
      }
      this.timers.clear();
    });
  }

  show(options: ToastOptions): number {
    const variant = options.variant ?? 'info';
    const id = this.nextId++;

    const toast: Toast = {
      ...options,
      id,
      variant,
      duration: options.duration ?? DEFAULT_DURATION[variant],
    };

    this.items.update((current) => [...current, toast]);

    if (toast.duration > 0) {
      this.timers.set(
        id,
        setTimeout(() => this.dismiss(id), toast.duration),
      );
    }

    return id;
  }

  success(title: string, message?: string): number {
    return this.show(
      message === undefined
        ? { variant: 'success', title }
        : { variant: 'success', title, message },
    );
  }

  error(title: string, message?: string): number {
    return this.show(
      message === undefined ? { variant: 'error', title } : { variant: 'error', title, message },
    );
  }

  dismiss(id: number): void {
    const timer = this.timers.get(id);

    if (timer !== undefined) {
      clearTimeout(timer);
      this.timers.delete(id);
    }

    this.items.update((current) => current.filter((toast) => toast.id !== id));
  }

  dismissAll(): void {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
    this.items.set([]);
  }
}
