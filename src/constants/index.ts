import { UserRole } from "../types/user.types";

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

//TODO: remove this when getting from db
export const DUMMY_USER = {
  id: "1",
  email: "dummy@dummy.com",
  displayName: "Jon Doe",
  firstName: "Jon",
  lastName: "Doe",
  image: "http://image.test-image.png",
  provider: "google",
  role: UserRole.USER,
};
