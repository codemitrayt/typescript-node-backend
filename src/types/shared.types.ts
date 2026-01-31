import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";
import { Document } from "mongoose";

export type CustomModel<T> = T & Document;

export interface CustomJwtPayload extends JwtPayload {
  user: { _id: string };
}

export interface CustomRequest<T = null> extends Request {
  body: T;
  user?: Express.User | undefined;
}

export type Filter = Record<string, unknown>;
