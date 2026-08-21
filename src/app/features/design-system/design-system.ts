import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { Badge } from '@shared/components/badge/badge';
import { Breadcrumb, type BreadcrumbItem } from '@shared/components/breadcrumb/breadcrumb';
import { Button } from '@shared/components/button/button';
import { Card } from '@shared/components/card/card';
import { Checkbox } from '@shared/components/checkbox/checkbox';
import { ConfirmDialog } from '@shared/components/confirm-dialog/confirm-dialog';
import { Drawer } from '@shared/components/drawer/drawer';
import { EmptyState } from '@shared/components/empty-state/empty-state';
import { ErrorState } from '@shared/components/error-state/error-state';
import { IconButton } from '@shared/components/icon-button/icon-button';
import { Icon } from '@shared/components/icon/icon';
import { ICON_NAMES } from '@shared/components/icon/icon-name';
import { TextInput } from '@shared/components/input/input';
import { Modal } from '@shared/components/modal/modal';
import { PageContainer } from '@shared/components/page-container/page-container';
import { Pagination } from '@shared/components/pagination/pagination';
import { QuantitySelector } from '@shared/components/quantity-selector/quantity-selector';
import { RadioGroup } from '@shared/components/radio-group/radio-group';
import { Rating } from '@shared/components/rating/rating';
import { Select } from '@shared/components/select/select';
import { Skeleton } from '@shared/components/skeleton/skeleton';
import { Spinner } from '@shared/components/spinner/spinner';
import { ToastService } from '@shared/components/toast/toast.service';
import type { ChoiceOption } from '@shared/models/option.model';

/**
 * Living reference for the design system.
 *
 * Registered only for non-production builds (see the route table): it is a
 * development surface for reviewing components side by side, not part of the
 * storefront, and it is intentionally not linked from any navigation.
 *
 * It doubles as the integration check that every control really works with Reactive
 * Forms — the form below binds each `ControlValueAccessor` component with
 * `formControlName` and echoes the resulting value.
 */
@Component({
  selector: 'app-design-system',
  imports: [
    JsonPipe,
    ReactiveFormsModule,
    PageContainer,
    Badge,
    Breadcrumb,
    Button,
    Card,
    Checkbox,
    ConfirmDialog,
    Drawer,
    EmptyState,
    ErrorState,
    Icon,
    IconButton,
    Modal,
    Pagination,
    QuantitySelector,
    RadioGroup,
    Rating,
    Select,
    Skeleton,
    Spinner,
    TextInput,
  ],
  templateUrl: './design-system.html',
  styleUrl: './design-system.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DesignSystem {
  private readonly toastService = inject(ToastService);

  protected readonly iconNames = ICON_NAMES;

  protected readonly sizeOptions: readonly ChoiceOption[] = [
    { value: 'sm', label: 'Small' },
    { value: 'md', label: 'Medium' },
    { value: 'lg', label: 'Large' },
    { value: 'xl', label: 'Extra large (unavailable)', disabled: true },
  ];

  protected readonly deliveryOptions: readonly ChoiceOption[] = [
    { value: 'standard', label: 'Standard delivery' },
    { value: 'express', label: 'Express delivery' },
    { value: 'collect', label: 'Click and collect' },
  ];

  protected readonly breadcrumbTrail: readonly BreadcrumbItem[] = [
    { label: 'Home', url: '/home' },
    { label: 'Shop', url: '/products' },
    { label: 'Example product' },
  ];

  /** Demonstrates that every control participates in Reactive Forms. */
  protected readonly form = new FormGroup({
    fullName: new FormControl('', { nonNullable: true }),
    email: new FormControl('', { nonNullable: true }),
    size: new FormControl('md', { nonNullable: true }),
    delivery: new FormControl('standard', { nonNullable: true }),
    quantity: new FormControl(1, { nonNullable: true }),
    score: new FormControl(4, { nonNullable: true }),
    newsletter: new FormControl(false, { nonNullable: true }),
    locked: new FormControl({ value: 'Disabled by the form', disabled: true }),
  });

  protected readonly modalOpen = signal(false);
  protected readonly drawerOpen = signal(false);
  protected readonly confirmOpen = signal(false);
  protected readonly confirmBusy = signal(false);
  protected readonly loadingButton = signal(false);

  protected readonly currentPage = signal(4);
  protected readonly lastConfirmResult = signal<string | null>(null);

  protected onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  protected notify(variant: 'success' | 'error' | 'warning' | 'info'): void {
    this.toastService.show({
      variant,
      title: `${variant[0]?.toUpperCase() ?? ''}${variant.slice(1)} notification`,
      message: 'Toasts stack, announce politely, and can always be dismissed by hand.',
    });
  }

  protected onConfirmed(): void {
    this.confirmBusy.set(true);

    // Stands in for a caller's async work, showing the busy state on the button.
    setTimeout(() => {
      this.confirmBusy.set(false);
      this.confirmOpen.set(false);
      this.lastConfirmResult.set('Confirmed');
    }, 600);
  }

  protected onCancelled(): void {
    this.lastConfirmResult.set('Cancelled');
  }

  protected toggleLoading(): void {
    this.loadingButton.update((loading) => !loading);
  }
}
