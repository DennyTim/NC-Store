export default class ErrorResponse extends Error {
  constructor(
    public message,
    public statusCode,
  ) {
    super(message);
    this.statusCode = statusCode;

    Error.captureStackTrace(this, this.constructor);
  }
}
