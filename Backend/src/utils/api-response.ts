export type ResponseMeta = Readonly<Record<string, unknown>>;

export class ApiResponse<T> {
  public readonly success = true;
  public readonly message: string;
  public readonly data: T;
  public readonly meta: ResponseMeta;

  public constructor(
    message: string,
    data: T,
    meta: ResponseMeta = {},
  ) {
    this.message = message;
    this.data = data;
    this.meta = meta;
  }
}
