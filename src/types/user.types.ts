export enum UserRole {
  ADMIN = "Admin",
  USER = "User",
  SUPER_ADMIN = "Super Admin",
}

export interface Avatar {
  url: string;
}

export interface User {
  _id: string;
  fullName: string;
  email: string;
  avatar: Avatar;
  password: string;
  role?: UserRole;
  isVerified?: boolean;
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
