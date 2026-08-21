import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ToastContainer } from '@shared/components/toast/toast-container';
import { AuthStore } from '@state/auth.store';

/**
 * Root component.
 *
 * An outlet plus the single toast outlet — page chrome belongs to routed layout
 * components so the application can host more than one shell.
 *
 * The auth store is initialised here, which restores a session from localStorage if
 * one exists so the user does not have to re-login on every page refresh.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainer],
  template: `
    <router-outlet />
    <app-toast-container />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  constructor() {
    inject(AuthStore).initialize();
  }
}
