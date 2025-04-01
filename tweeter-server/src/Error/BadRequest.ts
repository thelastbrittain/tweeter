export class BadRequest implements Error {
  name: string = "BadRequest";

  constructor(message: string, cause?: unknown) {
    this.message = "Bad Request: " + message;
    this.cause = cause;
  }
  message: string;
  cause?: unknown;
}
