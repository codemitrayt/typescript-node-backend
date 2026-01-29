import { ERROR_MESSAGES } from "../constants";

class ApiError extends Error {
  statusCode: number;
  data: unknown | null;
  success: boolean;
  errors: unknown[];

  constructor(
    statusCode: number,
    message: string = ERROR_MESSAGES.SERVER_ERROR,
    errors: unknown[] = [],
    stack: string = "",
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
