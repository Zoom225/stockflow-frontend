export interface ApiErrorResponse {
  readonly timestamp: string;
  readonly status: number;
  readonly error: string;
  readonly message: string;
  readonly path: string;
  readonly fieldErrors: Readonly<Record<string, string>> | null;
}
