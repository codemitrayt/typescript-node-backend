import "express-session";
import { IUser } from "./user.types";

declare module "express-session" {
  interface SessionData {
    passport: {
      user: string;
    };
  }
}

declare global {
  namespace Express {
    interface User extends IUser {
      id: string;
    }
  }
}
