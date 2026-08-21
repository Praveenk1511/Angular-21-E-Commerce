import { inject, signal, type WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

import { uniqueId } from '@core/utils/unique-id';

/** Open/closed state for a collapsible layout panel. */
export interface Disclosure {
  /** Unique id, wired to the trigger's `aria-controls` and the panel's `id`. */
  readonly panelId: string;
  readonly isOpen: WritableSignal<boolean>;
}

/**
 * State for a collapsible navigation panel that closes itself on navigation.
 *
 * Both the storefront header menu and the admin sidebar need identical wiring: a
 * unique panel id, an open flag, and a subscription that collapses the panel once
 * a route change completes so following a link does not leave the panel covering
 * the page it just opened. That subscription is the easy part to get wrong —
 * forgetting `takeUntilDestroyed()` leaks — so it lives here once.
 *
 * Focus management stays with the caller, because returning focus needs a
 * reference to that component's own trigger element.
 *
 * Must be called from an injection context (a field initialiser or constructor).
 */
export function createDisclosure(idPrefix: string): Disclosure {
  const isOpen = signal(false);

  inject(Router)
    .events.pipe(
      filter((event) => event instanceof NavigationEnd),
      takeUntilDestroyed(),
    )
    .subscribe(() => isOpen.set(false));

  return { panelId: uniqueId(idPrefix), isOpen };
}
