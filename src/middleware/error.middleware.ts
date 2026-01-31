import { NextFunction, Request, Response } from "express";

import { ENV } from "../config";
import { logger } from "../logger";
import { ApiError } from "../utils";
import { ERROR_MESSAGES, NODE_ENV } from "../constant";

export const errorHandler = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  err: any,
  req: Request,
  res: Response,
  _: NextFunction,
) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode ? error.statusCode : 500;
    const message = error.message || ERROR_MESSAGES.SERVER_ERROR;
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  const response = {
    ...error,
    message: error.message,
    ...(ENV.NODE_ENV === NODE_ENV.DEVELOPMENT ? { stack: error.stack } : {}),
  };

  logger.error(`${error.message}`);

  return res.status(error.statusCode).json(response);
};
