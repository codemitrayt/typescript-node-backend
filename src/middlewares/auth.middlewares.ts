import jwt from "jsonwebtoken";
import { NextFunction, Response, Request } from "express";

import { ENV } from "../configs";
import { logger } from "../logger";
import { ApiError, asyncHandler } from "../utils";
import { User, UserRole } from "../types/user.types";
import { DUMMY_USER, ERROR_MESSAGES, NODE_ENV } from "../constants";
import { CustomJwtPayload, CustomRequest } from "../types/shared.types";

// Helper function to extract token from request
const extractToken = (req: Request): string | undefined => {
  return (
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "")
  );
};

// Helper function to verify and decode token
const verifyToken = (token: string): CustomJwtPayload => {
  return jwt.verify(token, ENV.ACCESS_TOKEN_SECRET) as CustomJwtPayload;
};

// Helper function to validate user from decoded token
const validateDecodedUser = (decodedToken: CustomJwtPayload): void => {
  if (!decodedToken.user?.id) {
    throw new ApiError(401, ERROR_MESSAGES.INVALID_JWT_TOKEN);
  }
};

export const verifyJWT = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const token = extractToken(req);

    if (!token) {
      throw new ApiError(401, ERROR_MESSAGES.UNAUTHORIZED_REQUEST);
    }

    try {
      const decodedToken = verifyToken(token);
      validateDecodedUser(decodedToken);

      //TODO: find user in the DB
      const user = {};

      if (!user) {
        throw new ApiError(401, ERROR_MESSAGES.INVALID_JWT_TOKEN);
      }

      req.user = DUMMY_USER;
      next();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : ERROR_MESSAGES.INVALID_JWT_TOKEN;

      throw new ApiError(401, errorMessage);
    }
  },
);

export const getLoggedInUserOrIgnore = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const token = extractToken(req);

    if (!token) {
      return next();
    }

    try {
      const decodedToken = verifyToken(token);

      if (!decodedToken?.user?.id) {
        return next();
      }

      //TODO: check user in DB
      req.user = DUMMY_USER;
    } catch (error) {
      logger.error({ error });
    }

    next();
  },
);

export const verifyPermission = (roles: UserRole[] = []) =>
  asyncHandler(
    async (req: CustomRequest, _res: Response, next: NextFunction) => {
      if (!req.user) {
        throw new ApiError(401, ERROR_MESSAGES.UNAUTHORIZED_REQUEST);
      }
      const user = req.user as User;
      if (!user?.role || !roles.includes(user?.role)) {
        throw new ApiError(403, ERROR_MESSAGES.PERMISSION_DENIED);
      }
      next();
    },
  );

export const avoidInProduction = asyncHandler(
  async (_req: Request, _res: Response, next: NextFunction) => {
    if (ENV.NODE_ENV !== NODE_ENV.DEVELOPMENT) {
      throw new ApiError(
        403,
        "This service is only available in the local environment.",
      );
    }

    next();
  },
);
