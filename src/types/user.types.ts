import { Document, Types } from "mongoose";

export enum UserRole {
  ADMIN = "Admin",
  USER = "User",
  SUPER_ADMIN = "Super Admin",
}

export interface Avatar {
  url: string;
}

export enum LoginType {
  EMAIL = "EMAIL",
  GOOGLE = "GOOGLE",
  GITHUB = "GITHUB",
}

export interface IUser {
  _id: string;
  fullName: string;
  email: string;
  avatar: Avatar;
  password: string;
  role?: UserRole;
  isVerified?: boolean;
}

export interface UserType extends Document {
  tenantId?: Types.ObjectId | null;
  email: string;
  fullName: string;
  role: UserRole;
  isVerified: boolean;
  avatar?: Record<string, string> | null;
  password: string;
  loginType?: LoginType | null;
  lastActiveAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserFilter {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
}

export interface ILoginRequestBody {
  email: string;
  password: string;
}

export interface IVerifyRequestBody {
  token: string;
}
