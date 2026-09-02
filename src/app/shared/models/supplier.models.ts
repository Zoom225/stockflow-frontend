export interface SupplierRequest {
  readonly name: string;
  readonly contactName: string;
  readonly email: string;
  readonly phone: string | null;
  readonly address: string | null;
}

export interface SupplierResponse {
  readonly id: number;
  readonly name: string;
  readonly contactName: string;
  readonly email: string;
  readonly phone: string | null;
  readonly address: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}
