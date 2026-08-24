export type DeliveryMethodId = 'standard' | 'express' | 'same-day';

export interface DeliveryOption {
  readonly id: DeliveryMethodId;
  readonly name: string;
  readonly description: string;
  readonly estimatedDelivery: string;
  readonly priceMinor: number;
}
