import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { IconButton } from '@shared/components/icon-button/icon-button';
import { Icon } from '@shared/components/icon/icon';
import type { IconName } from '@shared/components/icon/icon-name';

import type { Toast, ToastVariant } from './toast.model';
import { ToastService } from './toast.service';

const VARIANT_ICON: Record<ToastVariant, IconName> = {
  success: 'check-circle',
  error: 'alert-triangle',
  warning: 'alert-triangle',
  info: 'info',
};

/**
 * Renders the {@link ToastService} queue.
 *
 * Mounted once, at the application root, so notifications survive navigation and
 * there is exactly one live region rather than one per layout.
 *
 * The region is `aria-live="polite"` and always present in the DOM — a live region
 * added at the same moment as its content is frequently missed by screen readers, so
 * the empty container has to exist up front. Individual toasts use `role="status"`,
 * except errors which use `role="alert"` to interrupt.
 */
@Component({
  selector: 'app-toast-container',
  imports: [Icon, IconButton],
  templateUrl: './toast-container.html',
  styleUrl: './toast-container.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastContainer {
  private readonly toastService = inject(ToastService);

  protected readonly toasts = this.toastService.toasts;

  protected iconFor(toast: Toast): IconName {
    return VARIANT_ICON[toast.variant];
  }

  protected roleFor(toast: Toast): 'alert' | 'status' {
    return toast.variant === 'error' ? 'alert' : 'status';
  }

  protected dismiss(id: number): void {
    this.toastService.dismiss(id);
  }
}
