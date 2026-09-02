export interface CategoryRequest {
  readonly name: string;
  readonly description: string | null;
}

export interface CategoryResponse {
  readonly id: number;
  readonly name: string;
  readonly description: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}
