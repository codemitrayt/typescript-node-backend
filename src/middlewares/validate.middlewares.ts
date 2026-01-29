import { Request, Response, NextFunction } from "express";
import { ValidationError, validationResult } from "express-validator";

import { ApiError } from "../utils";

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors: unknown[] = [];
  errors.array().forEach((err: ValidationError) => {
    if (err.type === "field") {
      extractedErrors.push({ [err.path]: err.msg });
    } else {
      extractedErrors.push({ error: err.msg });
    }
  });

  throw new ApiError(422, "Received data is not valid", extractedErrors);
};
