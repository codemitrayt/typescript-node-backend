import jwt from "jsonwebtoken";
import { NextFunction, Response, Request } from "express";

import { User } from "../entities";
import { logger } from "../logger";
import { UserModel } from "../models";
import { AppDataSource, ENV } from "../config";
import { ApiError, asyncHandler } from "../utils";
import { IUser, UserRole } from "../types/user.types";
import { ERROR_MESSAGES, NODE_ENV } from "../constant";
import { CustomJwtPayload, CustomRequest } from "../types/shared.types";

const userRepository = AppDataSource.getRepository(User);

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

      const user = await userRepository.findOne({
        where: { id: decodedToken.user.id },
      });

      if (!user) {
        throw new ApiError(401, ERROR_MESSAGES.INVALID_JWT_TOKEN);
      }

      req.user = user as unknown as IUser;
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

      const user = await UserModel.findById(decodedToken.user_.id);

      if (!user) {
        return next();
      }

      req.user = user;
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
      const user = req.user as IUser;
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
