import type { ResponseMeta } from "./api-response.js";

export class ApiError extends Error {
  public readonly success = false;

  public constructor(
    public readonly statusCode: number,
    message: string,
    public readonly data: unknown = null,
    public readonly meta: ResponseMeta = {},
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "ApiError";
  }
}
