import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import type { Category } from '@core/models';
import { Badge, type BadgeVariant } from '@shared/components/badge/badge';
import { Button } from '@shared/components/button/button';
import { EmptyState } from '@shared/components/empty-state/empty-state';
import { Icon } from '@shared/components/icon/icon';
import { ToastService } from '@shared/components/toast/toast.service';
import { AdminCategoryStore, type SaveCategoryPayload } from '@state/admin-category.store';

/**
 * Admin Category Management Page (/admin/categories).
 *
 * Renders Category list, Subcategories hierarchy badges, Image banners, status toggles,
 * Reactive Form for creating/editing categories, and a Destructive Action Confirmation Dialog.
 */
@Component({
  selector: 'app-admin-categories',
  imports: [
    ReactiveFormsModule,
    Badge,
    Button,
    Icon,
    EmptyState,
  ],
  templateUrl: './admin-categories.html',
  styleUrl: './admin-categories.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCategoriesPage {
  protected readonly store = inject(AdminCategoryStore);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  protected readonly formSubmitted = signal<boolean>(false);

  // ---------- Reactive Category Form ----------

  protected readonly categoryForm: FormGroup = this.fb.group({
    id: [''],
    name: ['', [Validators.required, Validators.minLength(2)]],
    slug: ['', [Validators.pattern(/^[a-z0-9-]+$/)]],
    parentId: [null as string | null],
    description: ['', [Validators.required, Validators.minLength(5)]],
    imageUrl: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80'],
    position: [1, [Validators.required, Validators.min(1)]],
    status: ['active' as 'active' | 'inactive', Validators.required],
  });

  protected isControlInvalid(controlName: string): boolean {
    const control = this.categoryForm.get(controlName);
    return !!(control && control.invalid && (control.touched || this.formSubmitted()));
  }

  // ---------- Action Handlers ----------

  protected openAddModal(): void {
    this.formSubmitted.set(false);
    this.categoryForm.reset({
      id: '',
      name: '',
      slug: '',
      parentId: null,
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
      position: this.store.totalCount() + 1,
      status: 'active',
    });
    this.store.openAddModal();
  }

  protected openEditModal(category: Category): void {
    this.formSubmitted.set(false);
    this.categoryForm.patchValue({
      id: category.id,
      name: category.name,
      slug: category.slug,
      parentId: category.parentId,
      description: category.description,
      imageUrl: category.imageUrl || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
      position: category.position,
      status: category.status || 'active',
    });
    this.store.openEditModal(category);
  }

  protected saveCategory(): void {
    this.formSubmitted.set(true);

    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      this.toast.error('Invalid Category Details', 'Please fill out all required fields.');
      return;
    }

    const val = this.categoryForm.value;

    const payload: SaveCategoryPayload = {
      id: val.id || undefined,
      name: val.name,
      slug: val.slug,
      parentId: val.parentId,
      description: val.description,
      imageUrl: val.imageUrl,
      position: Number(val.position),
      status: val.status,
    };

    const saved = this.store.saveCategory(payload);
    this.toast.success(
      'Category Saved',
      `Category "${saved.name}" has been ${val.id ? 'updated' : 'created'}.`,
    );
  }

  protected confirmDeleteCategory(): void {
    const target = this.store.confirmingDeleteCategory();
    if (!target) return;

    this.store.deleteCategory(target.id);
    this.toast.show({
      variant: 'info',
      title: 'Category Deleted',
      message: `Category "${target.name}" has been permanently removed.`,
    });
  }

  protected getStatusVariant(status: string | undefined): BadgeVariant {
    return status === 'inactive' ? 'neutral' : 'success';
  }
}
