import { StockMovementType } from './stock-movement.models';

export interface DashboardRecentMovementResponse {
  readonly id: number;
  readonly productId: number;
  readonly productName: string;
  readonly productSku: string;
  readonly type: StockMovementType;
  readonly quantity: number;
  readonly movementDate: string;
}

export interface DashboardSummaryResponse {
  readonly totalProducts: number;
  readonly totalCategories: number;
  readonly totalSuppliers: number;
  readonly lowStockProducts: number;
  readonly totalStockQuantity: number;
  readonly recentStockMovements: readonly DashboardRecentMovementResponse[];
}
