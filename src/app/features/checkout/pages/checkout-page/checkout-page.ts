import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';

import { APP_URLS } from '@core/config/route-paths';
import type { DeliveryMethodId, PaymentMethodType } from '@core/models';
import { AddressForm } from '@shared/components/address-form/address-form';
import { Badge } from '@shared/components/badge/badge';
import { Button } from '@shared/components/button/button';
import { EmptyState } from '@shared/components/empty-state/empty-state';
import { Icon } from '@shared/components/icon/icon';
import { PageContainer } from '@shared/components/page-container/page-container';
import { Spinner } from '@shared/components/spinner/spinner';
import { ToastService } from '@shared/components/toast/toast.service';
import { PricePipe } from '@shared/pipes/price.pipe';
import { AddressStore } from '@state/address.store';
import { CartStore } from '@state/cart.store';
import { CheckoutStore } from '@state/checkout.store';
import { OrdersStore } from '@state/orders.store';
import { PaymentStore } from '@state/payment.store';

/**
 * Complete Checkout Flow Page (/checkout).
 *
 * Renders multi-step checkout stepper, Step 1 Address, Step 2 Delivery Options, Step 3 Payment & Order Placement,
 * and integrates with OrdersStore for order creation.
 */
@Component({
  selector: 'app-checkout-page',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    PageContainer,
    Badge,
    Button,
    Icon,
    Spinner,
    EmptyState,
    PricePipe,
    AddressForm,
  ],
  templateUrl: './checkout-page.html',
  styleUrl: './checkout-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutPage {
  protected readonly addressStore = inject(AddressStore);
  protected readonly cartStore = inject(CartStore);
  protected readonly checkoutStore = inject(CheckoutStore);
  protected readonly paymentStore = inject(PaymentStore);
  protected readonly ordersStore = inject(OrdersStore);

  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  protected readonly cartUrl = APP_URLS.cart;
  protected readonly productsUrl = APP_URLS.products;
  protected readonly ordersUrl = APP_URLS.orders;

  protected getOrderDetailUrl(orderId: string): string {
    return APP_URLS.orderDetail(orderId);
  }

  // ---------- Payment Forms ----------
  protected readonly upiForm: FormGroup = this.fb.group({
    vpa: ['alex@okaxis', [Validators.required, Validators.pattern(/^[\w.-]+@[\w.-]+$/)]],
  });

  protected readonly cardForm: FormGroup = this.fb.group({
    cardholderName: ['Alex Morgan', [Validators.required, Validators.minLength(2)]],
    cardNumber: ['4532 1122 3344 5566', [Validators.required, Validators.pattern(/^[0-9\s]{16,19}$/)]],
    expiry: ['12/28', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)]],
    cvv: ['888', [Validators.required, Validators.pattern(/^[0-9]{3,4}$/)]],
  });

  protected readonly netBankingForm: FormGroup = this.fb.group({
    bankCode: ['HDFC', [Validators.required]],
  });

  protected readonly codForm: FormGroup = this.fb.group({
    confirmed: [true, [Validators.requiredTrue]],
  });

  protected paymentSubmitted = false;

  protected readonly popularBanks = [
    { code: 'HDFC', name: 'HDFC Bank' },
    { code: 'SBI', name: 'State Bank of India' },
    { code: 'ICICI', name: 'ICICI Bank' },
    { code: 'AXIS', name: 'Axis Bank' },
    { code: 'PNB', name: 'Punjab National Bank' },
  ];

  // ---------- Actions ----------

  protected selectAddress(id: string): void {
    this.addressStore.selectAddress(id);
  }

  protected deleteAddress(event: Event, id: string, label: string): void {
    event.stopPropagation();
    this.addressStore.deleteAddress(id);
    this.toast.show({
      variant: 'info',
      title: 'Address Removed',
      message: `${label} address removed from your account.`,
    });
  }

  protected setDefaultAddress(event: Event, id: string, label: string): void {
    event.stopPropagation();
    this.addressStore.setDefaultAddress(id);
    this.toast.success('Default Address Updated', `${label} is now your default delivery address.`);
  }

  protected confirmAddressAndProceed(): void {
    const selected = this.addressStore.selectedAddress();
    if (!selected) {
      this.toast.error('No Address Selected', 'Please select or add a delivery address to proceed.');
      return;
    }

    this.checkoutStore.setStep(2);
    this.toast.success(
      'Address Confirmed',
      `Delivering order to ${selected.recipient} (${selected.label}).`,
    );
  }

  protected selectDelivery(id: DeliveryMethodId): void {
    this.checkoutStore.selectDelivery(id);
  }

  protected confirmDeliveryAndProceed(): void {
    const selectedDel = this.checkoutStore.selectedDelivery();
    this.checkoutStore.setStep(3);
    this.toast.success(
      'Delivery Option Saved',
      `Selected ${selectedDel.name}. Please select your payment method.`,
    );
  }

  protected selectPaymentMethod(method: PaymentMethodType): void {
    this.paymentStore.selectMethod(method);
    this.paymentSubmitted = false;
  }

  protected isControlInvalid(form: FormGroup, controlName: string): boolean {
    const control = form.get(controlName);
    return !!(control && control.invalid && (control.touched || this.paymentSubmitted));
  }

  protected async submitPayment(): Promise<void> {
    this.paymentSubmitted = true;
    const method = this.paymentStore.selectedMethod();
    let methodData: Record<string, unknown> = {};
    let activeForm: FormGroup | null = null;

    switch (method) {
      case 'upi':
        activeForm = this.upiForm;
        methodData = this.upiForm.value as Record<string, unknown>;
        break;
      case 'credit-card':
      case 'debit-card':
        activeForm = this.cardForm;
        methodData = this.cardForm.value as Record<string, unknown>;
        break;
      case 'net-banking':
        activeForm = this.netBankingForm;
        methodData = this.netBankingForm.value as Record<string, unknown>;
        break;
      case 'cod':
        activeForm = this.codForm;
        methodData = this.codForm.value as Record<string, unknown>;
        break;
    }

    if (activeForm && activeForm.invalid) {
      activeForm.markAllAsTouched();
      this.toast.error('Invalid Payment Details', 'Please verify your payment information.');
      return;
    }

    const total = this.checkoutStore.checkoutTotalMinor();
    const cartItems = [...this.cartStore.cartItems()];
    const selectedAddr = this.addressStore.selectedAddress()!;
    const selectedDel = this.checkoutStore.selectedDelivery();
    const subtotal = this.cartStore.subtotalMinor();
    const discount = this.cartStore.discountMinor();
    const shipping = this.checkoutStore.deliveryPriceMinor();
    const tax = this.cartStore.taxMinor();

    const result = await this.paymentStore.processPayment(methodData, total);

    if (result.success && result.orderReference && result.transactionId) {
      const createdOrder = this.ordersStore.createOrder({
        orderRef: result.orderReference,
        transactionId: result.transactionId,
        cartItems,
        shippingAddress: selectedAddr,
        deliveryOption: selectedDel,
        paymentMethod: result.paymentMethod,
        totals: {
          currency: 'GBP',
          subtotalMinor: subtotal,
          discountMinor: discount,
          shippingMinor: shipping,
          taxMinor: tax,
          grandTotalMinor: total,
        },
      });

      this.toast.success(
        'Order Placed Successfully!',
        `Order Ref: ${createdOrder.reference}. Thank you for shopping with us!`,
      );
    } else {
      this.toast.error('Payment Failed', result.errorMessage ?? 'Transaction declined.');
    }
  }

  protected retryPayment(): void {
    this.paymentStore.clearError();
    this.paymentSubmitted = false;
  }
}
