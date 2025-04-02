export class BadRequest extends Error {
  constructor(message: string, cause?: unknown) {
    super("[Bad Request]: " + message);
    this.cause = cause;
    this.name = "BadRequest";
    this.cause = cause;
  }
  cause?: unknown;
}
