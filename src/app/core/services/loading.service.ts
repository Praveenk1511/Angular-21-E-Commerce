import { Injectable, computed, signal } from '@angular/core';

/**
 * Global in-flight request counter.
 *
 * The loading interceptor increments this on every outgoing API request and decrements
 * on completion (success or failure). Components read the `isLoading` signal to show
 * progress indicators without threading loading state through every store individually.
 *
 * This is a *global* indicator — it answers "is the app currently talking to the
 * server?" not "is this specific request loading?". Feature-level loading belongs in
 * each feature's store, and the two are complementary rather than alternatives:
 *
 * - A top-bar progress indicator reads `isLoading`.
 * - A product grid skeleton reads its own store's loading signal.
 *
 * Both are useful, and conflating them into one signal makes the second impossible.
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly inFlight = signal(0);

  /** True when at least one API request is still awaiting a response. */
  readonly isLoading = computed(() => this.inFlight() > 0);

  /** Number of requests currently in flight. Useful for debugging, not display. */
  readonly activeRequests = this.inFlight.asReadonly();

  /** Called by the loading interceptor when a request begins. */
  increment(): void {
    this.inFlight.update((count) => count + 1);
  }

  /** Called by the loading interceptor when a request finishes (success or error). */
  decrement(): void {
    this.inFlight.update((count) => Math.max(0, count - 1));
  }
}
