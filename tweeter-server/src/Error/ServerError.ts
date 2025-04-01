export class ServerError implements Error {
  name: string = "ServerError";

  constructor(message: string, cause?: unknown) {
    this.message = "Server Error: " + message;
    this.cause = cause;
  }
  message: string;
  cause?: unknown;
}
