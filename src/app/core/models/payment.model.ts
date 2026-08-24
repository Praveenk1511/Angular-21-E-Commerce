import type { IconName } from '@shared/components/icon/icon-name';

export type PaymentMethodType = 'upi' | 'credit-card' | 'debit-card' | 'net-banking' | 'cod';

export interface PaymentMethodOption {
  readonly id: PaymentMethodType;
  readonly title: string;
  readonly description: string;
  readonly iconName: IconName;
  readonly badge?: string;
}

export interface PaymentResult {
  readonly success: boolean;
  readonly transactionId?: string;
  readonly orderReference?: string;
  readonly errorMessage?: string;
  readonly paymentMethod: PaymentMethodType;
  readonly totalMinor: number;
}
