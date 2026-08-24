import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Icon } from '@shared/components/icon/icon';
import type { IconName } from '@shared/components/icon/icon-name';

interface Benefit {
  readonly icon: IconName;
  readonly title: string;
  readonly description: string;
}

@Component({
  selector: 'app-customer-benefits',
  imports: [Icon],
  templateUrl: './customer-benefits.html',
  styleUrl: './customer-benefits.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerBenefits {
  protected readonly benefits: readonly Benefit[] = [
    {
      icon: 'cart',
      title: 'Free delivery over ₹50',
      description: 'Standard shipping at no cost on orders above ₹50.',
    },
    {
      icon: 'check-circle',
      title: '10-year repair commitment',
      description: 'Every brand we stock offers long-term repair support.',
    },
    {
      icon: 'info',
      title: 'Secure payment',
      description: 'Card details are encrypted and never stored on our servers.',
    },
    {
      icon: 'inbox',
      title: '14-day free returns',
      description: 'Changed your mind? Return unused items within 14 days.',
    },
  ];
}
