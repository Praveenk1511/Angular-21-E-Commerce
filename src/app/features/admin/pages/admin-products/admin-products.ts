import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import type { Product, StockStatus } from '@core/models';
import { Badge, type BadgeVariant } from '@shared/components/badge/badge';
import { Button } from '@shared/components/button/button';
import { EmptyState } from '@shared/components/empty-state/empty-state';
import { Icon } from '@shared/components/icon/icon';
import { ToastService } from '@shared/components/toast/toast.service';
import { PricePipe } from '@shared/pipes/price.pipe';
import { AdminProductStore, type SaveProductPayload } from '@state/admin-product.store';

/**
 * Admin Product Management Page (/admin/products).
 *
 * Renders Product Data Table with thumbnail preview, name, SKU, price, stock status,
 * live search, pagination, and Reactive Forms for creating, editing, viewing, and deleting catalog items.
 */
@Component({
  selector: 'app-admin-products',
  imports: [
    ReactiveFormsModule,
    Badge,
    Button,
    Icon,
    EmptyState,
    PricePipe,
  ],
  templateUrl: './admin-products.html',
  styleUrl: './admin-products.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProductsPage {
  protected readonly store = inject(AdminProductStore);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  protected readonly formSubmitted = signal<boolean>(false);

  // ---------- Reactive Product Form ----------

  protected readonly productForm: FormGroup = this.fb.group({
    id: [''],
    name: ['', [Validators.required, Validators.minLength(3)]],
    sku: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9-]+$/)]],
    categoryId: ['cat-1', Validators.required],
    brandId: ['brand-1', Validators.required],
    priceAmount: [199.99, [Validators.required, Validators.min(0.01)]],
    compareAtPrice: [null, [Validators.min(0)]],
    currency: ['INR', Validators.required],
    availableStock: [25, [Validators.required, Validators.min(0)]],
    stockStatus: ['in-stock' as StockStatus, Validators.required],
    summary: ['', [Validators.required, Validators.minLength(10)]],
    description: ['', [Validators.required, Validators.minLength(15)]],
    weightGrams: [1200, [Validators.required, Validators.min(1)]],
    warrantyMonths: [24, [Validators.required, Validators.min(0)]],
    variantsText: ['Standard, Matte Black, Silver Alloy'],
    imageUrl: [
      'https://images.unsplash.com/photo-1580481072645-022f9a6d8310?auto=format&fit=crop&w=600&q=80',
      Validators.required,
    ],
    specifications: this.fb.array([]),
  });

  get specificationsArray(): FormArray {
    return this.productForm.get('specifications') as FormArray;
  }

  protected addSpecification(label = '', value = ''): void {
    this.specificationsArray.push(
      this.fb.group({
        label: [label, Validators.required],
        value: [value, Validators.required],
      }),
    );
  }

  protected removeSpecification(index: number): void {
    this.specificationsArray.removeAt(index);
  }

  protected isControlInvalid(controlName: string): boolean {
    const control = this.productForm.get(controlName);
    return !!(control && control.invalid && (control.touched || this.formSubmitted()));
  }

  // ---------- Action Handlers ----------

  protected openAddModal(): void {
    this.formSubmitted.set(false);
    this.specificationsArray.clear();

    this.productForm.reset({
      id: '',
      name: '',
      sku: '',
      categoryId: 'cat-1',
      brandId: 'brand-1',
      priceAmount: 199.99,
      compareAtPrice: null,
      currency: 'INR',
      availableStock: 25,
      stockStatus: 'in-stock',
      summary: '',
      description: '',
      weightGrams: 1200,
      warrantyMonths: 24,
      variantsText: 'Standard, Matte Black, Silver Alloy',
      imageUrl: 'https://images.unsplash.com/photo-1580481072645-022f9a6d8310?auto=format&fit=crop&w=600&q=80',
    });

    this.addSpecification('Warranty', '24 Months');
    this.addSpecification('Weight Capacity', '150 kg');

    this.store.openAddModal();
  }

  protected openEditModal(product: Product): void {
    this.formSubmitted.set(false);
    this.specificationsArray.clear();

    this.productForm.patchValue({
      id: product.id,
      name: product.name,
      sku: product.sku,
      categoryId: product.categoryId,
      brandId: product.brandId,
      priceAmount: product.price.amountMinor / 100,
      compareAtPrice: product.price.compareAtMinor ? product.price.compareAtMinor / 100 : null,
      currency: product.price.currency,
      availableStock: product.stock.available,
      stockStatus: product.stock.status,
      summary: product.summary,
      description: product.description,
      weightGrams: product.weightGrams,
      warrantyMonths: product.warrantyMonths,
      variantsText: 'Standard, Matte Black, Silver Alloy',
      imageUrl: product.thumbnail.url,
    });

    if (product.specifications && product.specifications.length > 0) {
      for (const spec of product.specifications) {
        this.addSpecification(spec.label, spec.value);
      }
    } else {
      this.addSpecification('Warranty', `${product.warrantyMonths} Months`);
    }

    this.store.openEditModal(product);
  }

  protected saveProduct(): void {
    this.formSubmitted.set(true);

    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      this.toast.error('Invalid Product Details', 'Please fill out all required fields.');
      return;
    }

    const val = this.productForm.value;

    const payload: SaveProductPayload = {
      id: val.id || undefined,
      name: val.name,
      sku: val.sku,
      categoryId: val.categoryId,
      brandId: val.brandId,
      priceAmount: Number(val.priceAmount),
      compareAtPrice: val.compareAtPrice ? Number(val.compareAtPrice) : null,
      currency: val.currency,
      availableStock: Number(val.availableStock),
      stockStatus: val.stockStatus,
      summary: val.summary,
      description: val.description,
      weightGrams: Number(val.weightGrams),
      warrantyMonths: Number(val.warrantyMonths),
      variantsText: val.variantsText,
      imageUrl: val.imageUrl,
      specifications: val.specifications,
    };

    const saved = this.store.saveProduct(payload);
    this.toast.success(
      'Product Saved',
      `Product "${saved.name}" has been successfully ${val.id ? 'updated' : 'created'}.`,
    );
  }

  protected deleteProduct(product: Product): void {
    this.store.deleteProduct(product.id);
    this.toast.show({
      variant: 'info',
      title: 'Product Deleted',
      message: `Product "${product.name}" was removed from the catalog.`,
    });
  }

  protected getStockVariant(status: StockStatus): BadgeVariant {
    switch (status) {
      case 'in-stock':
        return 'success';
      case 'low-stock':
        return 'warning';
      case 'out-of-stock':
        return 'danger';
      case 'preorder':
        return 'brand';
      default:
        return 'neutral';
    }
  }

  protected computeDiscountPct(price: number, compareAt: number | null): number | null {
    if (!compareAt || compareAt <= price) return null;
    return Math.round(((compareAt - price) / compareAt) * 100);
  }
}
