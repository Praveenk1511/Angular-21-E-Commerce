import type { Price, ProductImage, StockStatus } from './product.model';

export interface WishlistItem {
  readonly productId: string;
  readonly slug: string;
  readonly name: string;
  readonly brandName?: string | undefined;
  readonly price: Price;
  readonly thumbnail: ProductImage;
  readonly stockStatus: StockStatus;
  readonly availableStock: number;
  readonly addedAt: string;
}
