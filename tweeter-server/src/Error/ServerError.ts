export class ServerError extends Error {
  constructor(message: string, cause?: unknown) {
    super("[Server Error]: " + message);
    this.cause = cause;
    this.name = "ServerError";
  }
  cause?: unknown;
}
