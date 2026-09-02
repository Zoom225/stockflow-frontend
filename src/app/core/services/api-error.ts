export class ApiError extends Error {
  override readonly name = 'ApiError';

  constructor(
    readonly status: number,
    message: string,
    readonly fieldErrors: Readonly<Record<string, string>> = {},
  ) {
    super(message);
  }
}
