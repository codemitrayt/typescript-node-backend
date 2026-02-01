import "express-session";
import { IUser as UserType } from "./user.types";

declare module "express-session" {
  interface SessionData {
    passport: {
      user: string;
    };
  }
}

declare global {
  namespace Express {
    interface User extends UserType {
      _id: string;
    }
  }
}
