import { Injectable, computed, inject, signal } from '@angular/core';

import type { DeliveryMethodId, DeliveryOption } from '@core/models';
import { CartStore } from '@state/cart.store';

/**
 * Root state manager for the Checkout Flow process.
 *
 * Manages active checkout step navigation (Step 1 Address, Step 2 Delivery, Step 3 Payment/Review),
 * selected delivery option, dynamic delivery pricing calculation, and checkout total updates.
 */
@Injectable({ providedIn: 'root' })
export class CheckoutStore {
  private readonly cartStore = inject(CartStore);

  // ---------- Internal State ----------
  readonly activeStep = signal<number>(1);
  readonly selectedDeliveryId = signal<DeliveryMethodId>('standard');

  // ---------- Derived State ----------

  /** Dynamic list of delivery options reflecting cart subtotal rules (e.g. Free Standard Delivery over £50). */
  readonly deliveryOptions = computed<readonly DeliveryOption[]>(() => {
    const subtotal = this.cartStore.subtotalMinor();
    const isFreeStandard = subtotal >= 5000;

    return [
      {
        id: 'standard',
        name: 'Standard Delivery',
        description: 'Standard tracked shipping via Royal Mail or Hermes.',
        estimatedDelivery: '3–5 Business Days',
        priceMinor: isFreeStandard ? 0 : 499,
      },
      {
        id: 'express',
        name: 'Express Delivery',
        description: 'Priority courier dispatch with full end-to-end tracking.',
        estimatedDelivery: '1–2 Business Days',
        priceMinor: 999,
      },
      {
        id: 'same-day',
        name: 'Same Day Delivery',
        description: 'Guaranteed evening delivery for orders placed before 2 PM.',
        estimatedDelivery: 'Today by 8:00 PM',
        priceMinor: 1499,
      },
    ];
  });

  /** Currently selected delivery option object. */
  readonly selectedDelivery = computed<DeliveryOption>(() => {
    const options = this.deliveryOptions();
    const selId = this.selectedDeliveryId();
    return options.find((opt) => opt.id === selId) ?? options[0]!;
  });

  /** Selected delivery cost in minor units. */
  readonly deliveryPriceMinor = computed(() => this.selectedDelivery().priceMinor);

  /** Final checkout grand total in minor units (subtotal + delivery cost). */
  readonly checkoutTotalMinor = computed(
    () => this.cartStore.subtotalMinor() + this.deliveryPriceMinor(),
  );

  // ---------- Actions ----------

  /**
   * Sets current active checkout step.
   */
  setStep(step: number): void {
    if (step >= 1 && step <= 3) {
      this.activeStep.set(step);
    }
  }

  /**
   * Selects a delivery method by ID.
   */
  selectDelivery(id: DeliveryMethodId): void {
    this.selectedDeliveryId.set(id);
  }

  /**
   * Navigates to the next step.
   */
  nextStep(): void {
    const current = this.activeStep();
    if (current < 3) {
      this.activeStep.set(current + 1);
    }
  }

  /**
   * Navigates to the previous step.
   */
  previousStep(): void {
    const current = this.activeStep();
    if (current > 1) {
      this.activeStep.set(current - 1);
    }
  }
}
