/** A merchandising category. Categories form a shallow tree, at most two levels. */
export interface Category {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly description: string;
  /** `null` for a top-level category. */
  readonly parentId: string | null;
  /** Display order within its parent. */
  readonly position: number;
  /** Products directly in this category, excluding descendants. */
  readonly productCount: number;
}

/** A category with its children resolved, as returned by the tree endpoint. */
export interface CategoryTreeNode extends Category {
  readonly children: readonly CategoryTreeNode[];
  /** Products in this category and every descendant. */
  readonly totalProductCount: number;
}

export interface Brand {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly description: string;
  readonly countryOfOrigin: string;
  readonly foundedYear: number;
  readonly productCount: number;
}
