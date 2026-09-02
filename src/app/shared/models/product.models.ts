export interface ProductRequest {
  readonly sku: string;
  readonly name: string;
  readonly description: string | null;
  readonly purchasePrice: number;
  readonly sellingPrice: number;
  readonly categoryId: number;
  readonly minimumStock: number;
  readonly supplierId: number | null;
}

export interface ProductResponse {
  readonly id: number;
  readonly sku: string;
  readonly name: string;
  readonly description: string | null;
  readonly purchasePrice: number;
  readonly sellingPrice: number;
  readonly quantityInStock: number;
  readonly minimumStock: number;
  readonly lowStock: boolean;
  readonly categoryId: number;
  readonly categoryName: string;
  readonly supplierId: number | null;
  readonly supplierName: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}
