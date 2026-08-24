import type { Price, ProductImage, StockStatus } from './product.model';

export interface CartItem {
  readonly productId: string;
  readonly slug: string;
  readonly name: string;
  readonly brandName?: string | undefined;
  readonly price: Price;
  readonly thumbnail: ProductImage;
  readonly quantity: number;
  readonly availableStock: number;
  readonly stockStatus: StockStatus;
  readonly selectedVariant?: string | undefined;
}

export interface CartSummary {
  readonly itemCount: number;
  readonly subtotalMinor: number;
  readonly discountMinor: number;
  readonly shippingMinor: number;
  readonly taxMinor: number;
  readonly totalMinor: number;
}
