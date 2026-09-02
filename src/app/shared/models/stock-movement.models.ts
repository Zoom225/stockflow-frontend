export type StockMovementType = 'IN' | 'OUT';

export interface StockMovementRequest {
  readonly productId: number;
  readonly type: StockMovementType;
  readonly quantity: number;
  readonly reason: string | null;
  readonly movementDate: string | null;
}

export interface RestockProductRequest {
  readonly quantity: number;
  readonly reason: string | null;
  readonly movementDate: string | null;
}

export interface OutboundStockRequest {
  readonly quantity: number;
  readonly reason: string | null;
  readonly movementDate: string | null;
}

export interface StockMovementResponse {
  readonly id: number;
  readonly productId: number;
  readonly productName: string;
  readonly productSku: string;
  readonly type: StockMovementType;
  readonly quantity: number;
  readonly reason: string | null;
  readonly movementDate: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
