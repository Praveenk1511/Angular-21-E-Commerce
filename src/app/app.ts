import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ToastContainer } from '@shared/components/toast/toast-container';

/**
 * Root component.
 *
 * An outlet plus the single toast outlet — page chrome belongs to routed layout
 * components so the application can host more than one shell.
 *
 * Notifications are mounted here rather than in each layout so there is exactly one
 * live region in the document, and so a toast raised just before navigation is not
 * destroyed along with the layout that raised it.
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
export class App {}
