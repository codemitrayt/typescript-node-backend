import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

export interface CustomJwtPayload extends JwtPayload {
  user: { id: string };
}

export interface CustomRequest<T = null> extends Request {
  body: T;
  user?: Express.User | undefined;
}
