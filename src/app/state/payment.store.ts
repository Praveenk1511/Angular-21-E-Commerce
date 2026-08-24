import { Injectable, inject, signal } from '@angular/core';

import type { PaymentMethodOption, PaymentMethodType, PaymentResult } from '@core/models';
import { CartStore } from '@state/cart.store';

export const PAYMENT_METHODS: readonly PaymentMethodOption[] = [
  {
    id: 'upi',
    title: 'UPI (Instant Pay)',
    description: 'Google Pay, PhonePe, Paytm, BHIM, or any UPI ID',
    iconName: 'check-circle',
    badge: 'Fastest',
  },
  {
    id: 'credit-card',
    title: 'Credit Card',
    description: 'Visa, MasterCard, American Express, RuPay',
    iconName: 'check',
  },
  {
    id: 'debit-card',
    title: 'Debit Card',
    description: 'All major bank debit cards supported',
    iconName: 'check',
  },
  {
    id: 'net-banking',
    title: 'Net Banking',
    description: 'Pay directly from 50+ supported bank accounts',
    iconName: 'inbox',
  },
  {
    id: 'cod',
    title: 'Cash on Delivery',
    description: 'Pay cash or card upon delivery to your doorstep',
    iconName: 'user',
  },
];

/**
 * Root state manager for Payment Selection & Processing simulation.
 *
 * Manages active payment method selection, payment processing loading state,
 * error handling, failure simulation triggers, and order reference generation.
 */
@Injectable({ providedIn: 'root' })
export class PaymentStore {
  private readonly cartStore = inject(CartStore);

  // ---------- Internal State ----------
  readonly selectedMethod = signal<PaymentMethodType>('upi');
  readonly isProcessing = signal<boolean>(false);
  readonly paymentError = signal<string | null>(null);
  readonly lastResult = signal<PaymentResult | null>(null);

  readonly paymentMethods = PAYMENT_METHODS;

  // ---------- Actions ----------

  selectMethod(method: PaymentMethodType): void {
    this.selectedMethod.set(method);
    this.paymentError.set(null);
  }

  clearError(): void {
    this.paymentError.set(null);
  }

  /**
   * Simulates a frontend mock payment processing flow with network latency.
   */
  async processPayment(methodData: Record<string, unknown>, totalMinor: number): Promise<PaymentResult> {
    this.isProcessing.set(true);
    this.paymentError.set(null);

    // Simulate 1.5 seconds payment gateway network latency
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const method = this.selectedMethod();

    // Check mock failure triggers for demo testing
    const vpa = typeof methodData['vpa'] === 'string' ? methodData['vpa'] : '';
    const cardNumber = typeof methodData['cardNumber'] === 'string' ? methodData['cardNumber'] : '';

    const isFailureTrigger =
      vpa.toLowerCase().includes('fail') ||
      cardNumber.replace(/\s+/g, '').endsWith('0000');

    if (isFailureTrigger) {
      const errorMsg =
        'Transaction declined by issuing bank. Please verify your credentials or select an alternative payment method.';
      this.paymentError.set(errorMsg);
      this.isProcessing.set(false);

      return {
        success: false,
        errorMessage: errorMsg,
        paymentMethod: method,
        totalMinor,
      };
    }

    // Success Simulation
    const txnId = `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const orderRef = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    const result: PaymentResult = {
      success: true,
      transactionId: txnId,
      orderReference: orderRef,
      paymentMethod: method,
      totalMinor,
    };

    this.lastResult.set(result);
    this.cartStore.clearCart();
    this.isProcessing.set(false);

    return result;
  }
}
