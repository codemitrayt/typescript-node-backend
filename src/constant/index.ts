import { ILoginType, UserRole } from "../types/user.types";

export const NODE_ENV = {
  DEVELOPMENT: "development",
  PRODUCTION: "production",
};

export const ERROR_MESSAGES = {
  SERVER_ERROR: "Something went wrong",
  INVALID_JWT_TOKEN: "Invalid JWT token",
  UNAUTHORIZED_REQUEST: "Unauthorized request",
  PERMISSION_DENIED: "You are not allowed to perform this action",
};

export const AvailableUserRole: string[] = Object.values(UserRole);
export const AvailableLoginType: string[] = Object.values(ILoginType);
